#ifndef PHENOTYPE_HPP_
# define PHENOTYPE_HPP_

# include <list>
# include <cmath>
# include <map>
# include <algorithm>
# include <iostream>
# include <vector>

# include "Genotype.hpp"

namespace IndieNeat
{
  template <unsigned int numInputs, unsigned int numOutputs>
    class Phenotype
    {
      private:
	class Link
	{
	  public:
	    Link(double weight)
	      : _weight(weight), _used(false)
	    {}

	    ~Link(void)
	    {}

	    double&	Weight(void)
	    {
	      return (_weight);
	    }

	    bool&	isUsed(void)
	    {
	      return (_used);
	    }

	  private:
	    Link(Link const&);
	    Link&	operator=(Link const&);

	  private:
	    double	_weight;
	    bool	_used;
	};

	class Node
	{
	  public:
	    Node(unsigned int id, double bias)
	      : _id(id), _bias(bias), _value(0), _activ(false)
	    {}

	    ~Node(void)
	    {}

	    void	addInput(Node *node, Link *link)
	    {
	      _inputs.push_back(std::pair<Node *, Link *>(node, link));
	    }

	    void	addOutput(Node *node, Link *link)
	    {
	      _outputs.push_back(std::pair<Node *, Link *>(node, link));
	    }

	    unsigned int	Id(void) const
	    {
	      return (_id);
	    }

	    double	Value(void) const
	    {
	      return (_value);
	    }

	    bool	Active(void) const
	    {
	      return (_activ);
	    }

	    void	getFollowingNodes(std::vector<Node *>& nexts,
		std::vector<unsigned int> const& outputsIdx) const
	    {
	      unsigned int	j;

	      for (std::pair<Node *, Link *> const&	link : _outputs)
	      {
		j = 0;
		while (j < outputsIdx.size() && outputsIdx[j] != link.first->Id())
		  ++j;
		if (!link.first->Active() && j == outputsIdx.size())
		  nexts.push_back(link.first);
	      }
	    }

	    void	setActive(bool activ)
	    {
	      _activ = activ;
	    }

	    void	setValue(double value)
	    {
	      _value = value;
	    }

	    bool	activate(void)
	    {
	      double	potential = _bias;

	      for (std::pair<Node *, Link *>& link : _inputs)
	      {
		if (link.first->Active())
		  return (false);
		potential += link.first->Value() * link.second->Weight();
	      }
	      _value = _sigmoid(potential);
	      this->setActive(true);
	      return (true);
	    }

	    void	forceActivate(void)
	    {
	      double potential = _bias;

	      for (std::pair<Node *, Link *>& link : _inputs)
		potential += link.first->Value() * link.second->Weight();
	      _value = _sigmoid(potential);
	      this->setActive(true);
	    }

	  private:
	    Node(Node const&);
	    Node&	operator=(Node const&);

	    inline double	_sigmoid(double x)
	    {
	      return (1 / (1 + exp(-x)));
	    }

	  private:
	    unsigned int			_id;
	    double				_bias;
	    double				_value;
	    bool				_activ;
	    std::list<std::pair<Node *, Link *>>  _inputs;
	    std::list<std::pair<Node *, Link *>>  _outputs;
	};

      public:
	Phenotype(Genotype<numInputs, numOutputs> const& genome)
	  : _genome(genome)
	{}

	~Phenotype(void)
	{
	  for (Link *link : _links)
	    delete (link);
	  for (auto it = _neurons.begin(); it != _neurons.end(); it++)
	    delete (it->second);
	}

	void	init(void)
	{
	  std::vector<typename Genotype<numInputs, numOutputs>::Gene *> const& genes = _genome.Genes();
	  std::vector<typename Genotype<numInputs, numOutputs>::Node *> const& nodes = _genome.Nodes();
	  auto it1 = nodes.begin();
	  auto it2 = nodes.begin();
	  Link	*link;

	  for (typename Genotype<numInputs, numOutputs>::Gene *gene : genes)
	  {
	    if (gene->isEnabled())
	    {
	      link = new Link(gene->getWeight());

	      it1 = std::find_if(nodes.begin(), nodes.end(),
		  [&](typename Genotype<numInputs, numOutputs>::Node *node)
		  {
		  return (node->Id() == gene->Input());
		  });

	      if (_neurons.find(gene->Input()) == _neurons.end())
		_neurons[gene->Input()] = new Node(gene->Input(), (*it1)->Bias());

	      it2 = std::find_if(nodes.begin(), nodes.end(),
		  [&](typename Genotype<numInputs, numOutputs>::Node *node)
		  {
		  return (node->Id() == gene->Output());
		  });

	      if (_neurons.find(gene->Output()) == _neurons.end())
		_neurons[gene->Output()] = new Node(gene->Output(), (*it2)->Bias());

	      _neurons[gene->Output()]->addInput(_neurons[gene->Input()], link);
	      _neurons[gene->Input()]->addOutput(_neurons[gene->Output()], link);
	      _links.push_back(link);
	    }
	  }
	}

	std::vector<double> const&	getOutputs(void) const
	{
	  return (_answer);
	}

	std::vector<double> const&	feedForward(std::vector<double> const& inputs)
	{
	  std::vector<unsigned int>	inputsIdx;
	  std::vector<unsigned int>	outputsIdx;
	  std::vector<unsigned int>	hiddenIdx;
	  std::vector<Node *>		currentNodes;
	  std::vector<Node *>		waitingNodes;

	  _answer.clear();
	  _genome.getInputs(inputsIdx);
	  _genome.getOutputs(outputsIdx);
	  for (unsigned int i = 0; i < inputsIdx.size(); i++)
	  {
	    _neurons[inputsIdx[i]]->setValue(inputs[i]);
	    _neurons[inputsIdx[i]]->setActive(true);
	    _neurons[inputsIdx[i]]->getFollowingNodes(currentNodes, outputsIdx);
	  }

	  while (currentNodes.size())
	  {
	    for (unsigned int i = 0; i < currentNodes.size(); i++)
	    {
	      if (!currentNodes[i]->activate())
		waitingNodes.push_back(currentNodes[i]);
	    }

	    for (unsigned int i = 0; i < waitingNodes.size(); i++)
	      waitingNodes[i]->forceActivate();
	    waitingNodes.clear();

	    for (unsigned int i = 0; i < currentNodes.size(); i++)
	      waitingNodes.push_back(currentNodes[i]);
	    currentNodes.clear();

	    for	(unsigned int i = 0; i < waitingNodes.size(); i++)
	      waitingNodes[i]->getFollowingNodes(currentNodes, outputsIdx);

	    waitingNodes.clear();
	  }

	  for (unsigned int i = 0; i < outputsIdx.size(); i++)
	    _neurons[outputsIdx[i]]->forceActivate();

	  for (unsigned int i = 0; i < outputsIdx.size(); i++)
	    _answer.push_back(_neurons[outputsIdx[i]]->Value());

	  for (typename std::map<unsigned int, Node *>::iterator it = _neurons.begin();
	      it != _neurons.end(); it++)
	    it->second->setActive(true);
	  return (_answer);
	}

      private:
	Phenotype(Phenotype const& copy);
	Phenotype&	operator=(Phenotype const& copy);

      private:
	const Genotype<numInputs, numOutputs>&	_genome;
	std::map<unsigned int, Node *>		_neurons;
	std::list<Link *>			_links;
	std::vector<double>			_answer;
    };
}

#endif /* !PHENOTYPE_HPP_ */
