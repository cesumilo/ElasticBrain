#ifndef GENOTYPE_HPP_
# define GENOTYPE_HPP_

# include <utility>
# include <vector>
# include <random>

# include "MutationManager.hh"

namespace IndieNeat
{
  template <unsigned int numInputs, unsigned int numOutputs>
    class Genotype
    {
      public:
	enum class 			NodeType
	{
	  INPUT,
	  OUTPUT,
	  HIDDEN
	};

	enum class			State
	{
	  NOT_EVALUATED,
	  IN_EVALUATION,
	  IS_EVALUATED
	};

	class Node
	{
	  public:
	    Node(unsigned int id, NodeType type, double bias)
	      : _id(id), _type(type), _bias(bias)
	    {}

	    Node(Node const& copy)
	      : _id(copy._id), _type(copy._type), _bias(copy._bias)
	    {}

	    ~Node(void) {}

	    Node&	operator=(Node const& copy)
	    {
	      if (&copy == this)
		return (*this);

	      _id = copy._id;
	      _type = copy._type;
	      _bias = copy._bias;
	      return (*this);
	    }

	    unsigned int	Id(void) const
	    {
	      return (_id);
	    }

	    unsigned int&	Id(void)
	    {
	      return (_id);
	    }

	    NodeType	Type(void) const
	    {
	      return (_type);
	    }

	    NodeType&	Type(void)
	    {
	      return (_type);
	    }

	    double	Bias(void) const
	    {
	      return (_bias);
	    }

	    double&	Bias(void)
	    {
	      return (_bias);
	    }

	  private:
	    unsigned int	_id;
	    NodeType		_type;
	    double		_bias;
	};

	class Gene
	{
	  public:
	    Gene(unsigned int input, unsigned int output, long long innov,
		std::pair<double, double> const& range)
	      : _in(input), _out(output), _innov(innov), _enabled(true)
	    {
	      std::random_device			rd;
	      std::mt19937				gen(rd());
	      std::uniform_real_distribution<double>	distrib(range.first, range.second);

	      _weight = distrib(gen);
	    }

	    Gene(unsigned int input, unsigned int output, long long innov,
		bool enabled, double weight)
	      : _in(input), _out(output), _innov(innov), _enabled(enabled),
	      _weight(weight)
	    {}

	    Gene(Gene const& copy)
	      : _in(copy._in), _out(copy._out), _innov(copy._innov), _enabled(copy._enabled), _weight(copy._weight)
	    {}

	    ~Gene(void) {}

	    Gene&		operator=(Gene const& copy)
	    {
	      if (&copy == this)
		return (*this);

	      _in = copy._in;
	      _out = copy._out;
	      _innov = copy._innov;
	      _enabled = copy._enabled;
	      _weight = copy._weight;

	      return (*this);
	    }

	    void		setWeight(double weight)
	    {
	      _weight = weight;
	    }

	    double	getWeight(void) const
	    {
	      return (_weight);
	    }

	    void		toggleEnabled(void)
	    {
	      _enabled = !_enabled;
	    }

	    void		setEnabled(bool enabled)
	    {
	      _enabled = enabled;
	    }

	    bool		isEnabled(void) const
	    {
	      return (_enabled);
	    }

	    long long	getIno(void) const
	    {
	      return (_innov);
	    }

	    unsigned int	Input(void) const
	    {
	      return (_in);
	    }

	    unsigned int	Output(void) const
	    {
	      return (_out);
	    }

	  private:
	    unsigned int	_in;
	    unsigned int	_out;
	    long long		_innov;
	    bool		_enabled;
	    double		_weight;
	};

      public:
	Genotype(void) {}

	Genotype(std::pair<double, double> const& range)
	  : _numNodes(0), _fitness(0), _state(State::NOT_EVALUATED)
	{
	  std::random_device				rd;
	  std::mt19937					gen(rd());
	  std::uniform_real_distribution<double>	distrib(range.first, range.second);
	  long long					innovNumber;

	  for (unsigned int i = 0; i < numInputs; i++)
	    _nodes.push_back(new Node(_numNodes++, NodeType::INPUT, distrib(gen)));

	  for (unsigned int i = 0; i < numOutputs; i++)
	    _nodes.push_back(new Node(_numNodes++, NodeType::OUTPUT, distrib(gen)));

	  for (unsigned int i = 0; i < numInputs; i++)
	  {
	    for (unsigned int j = numInputs; j < numInputs + numOutputs; j++)
	    {
	      innovNumber = MutationManager::GetInnovationNumber(_nodes[i]->Id(),
		  _nodes[j]->Id(), MutationManager::MutationType::ADD_CONNECTION);
	      _genes.push_back(new Gene(_nodes[i]->Id(), _nodes[j]->Id(), innovNumber, range));
	    }
	  }
	}

	Genotype(Genotype const& copy)
	  : _fitness(copy._fitness), _state(State::NOT_EVALUATED)
	{
	  unsigned int	maxId = 0;

	  for (Node *node : copy._nodes)
	  {
	    if (node->Id() > maxId)
	      maxId = node->Id();
	    _nodes.push_back(new Node(*node));
	  }
	  _numNodes = maxId + 1;

	  for (Gene *gene : copy._genes)
	    _genes.push_back(new Gene(*gene));
	}

	~Genotype(void)
	{
	  for (Node *node : _nodes)
	    delete (node);
	  for (Gene *gene : _genes)
	    delete (gene);
	}

	Genotype&	operator=(Genotype const& copy)
	{
	  unsigned int	maxId = 0;

	  if (&copy == this)
	    return (*this);

	  _state = State::NOT_EVALUATED;
	  _fitness = copy._fitness;

	  for (Node *node : _nodes)
	    delete (node);
	  _nodes.clear();

	  for (Gene *gene : _genes)
	    delete (gene);
	  _genes.clear();

	  for (Node *node : copy._nodes)
	  {
	    if (node->Id() > maxId)
	      maxId = node->Id();
	    _nodes.push_back(new Node(*node));
	  }
	  _numNodes = maxId + 1;

	  for (Gene *gene : copy._genes)
	    _genes.push_back(new Gene(*gene));
	  return (*this);
	}

	std::vector<Node *>&	Nodes(void)
	{
	  return (_nodes);
	}

	std::vector<Gene *>&	Genes(void)
	{
	  return (_genes);
	}

	std::vector<Node *> const&	Nodes(void) const
	{
	  return (_nodes);
	}

	std::vector<Gene *> const&	Genes(void) const
	{
	  return (_genes);
	}

	void	getInputs(std::vector<unsigned int>& inputs) const
	{
	  for (Node *node : _nodes)
	  {
	    if (node->Type() == NodeType::INPUT)
	      inputs.push_back(node->Id());
	  }
	}

	void	getOutputs(std::vector<unsigned int>& outputs) const
	{
	  for (Node *node : _nodes)
	  {
	    if (node->Type() == NodeType::OUTPUT)
	      outputs.push_back(node->Id());
	  }
	}

	Node	*addNode(NodeType type, std::pair<double, double> const& range)
	{
	  std::random_device				rd;
	  std::mt19937					gen(rd());
	  std::uniform_real_distribution<double>	distrib(range.first, range.second);

	  Node	*node = new Node(_numNodes++, type, distrib(gen));
	  _nodes.push_back(node);
	  return (node);
	}

	void	setFitness(double fitness)
	{
	  _fitness = fitness;
	}

	double	getFitness(void) const
	{
	  return (_fitness);
	}

	void	setState(State state)
	{
	  _state = state;
	}

	State	getState(void) const
	{
	  return (_state);
	}

	long long		getNumNodes(void) const
	{
	  return (_numNodes);
	}

	void  setNumNodes(long long num)
	{
	  _numNodes = num;
	}

      private:
	long long		_numNodes;
	double			_fitness;
	State			_state;
	std::vector<Node *>	_nodes;
	std::vector<Gene *>	_genes;
    };
}

#endif /* !GENOTYPE_HPP_ */
