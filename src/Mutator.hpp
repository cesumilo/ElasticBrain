#ifndef MUTATOR_HPP_
# define MUTATOR_HPP_

# include <random>
# include <algorithm>
# include "Genotype.hpp"

namespace IndieNeat
{
  template<unsigned int numInputs, unsigned int numOutputs>
    class Mutator
    {
      public:
	struct	Settings
	{
	  Settings(void)
	    : weightRange(std::pair<double, double>(-10, 10)), pertubationRange(std::pair<double, double>(-2, 2)),
	    weightRandProb(0.1), addConnectionProb(0.05), addNodeProb(0.03), weightMutationProb(0.8)
	  {}

	  Settings(std::pair<double, double> const& weightR, std::pair<double, double> const& pertubRange,
	      double weightP, double connectionP, double nodeP, double weightMutProb)
	    : weightRange(weightR), pertubationRange(pertubRange), weightRandProb(weightP), addConnectionProb(connectionP),
	    addNodeProb(nodeP), weightMutationProb(weightMutProb)
	  {}

	  Settings(Settings const& settings)
	    : weightRange(settings.weightRange), pertubationRange(settings.pertubationRange),
	    weightRandProb(settings.weightRandProb), addConnectionProb(settings.addConnectionProb),
	    addNodeProb(settings.addNodeProb), weightMutationProb(settings.weightMutationProb)
	  {}

	  ~Settings(void) {}

	  Settings&	operator=(Settings const& settings)
	  {
	    if (&settings == this)
	      return (*this);

	    weightRange = settings.weightRange;
	    pertubationRange = settings.pertubationRange;
	    weightRandProb = settings.weightRandProb;
	    addConnectionProb = settings.addConnectionProb;
	    addNodeProb = settings.addNodeProb;
	    weightMutationProb = settings.weightMutationProb;
	    return (*this);
	  }

	  std::pair<double, double>	weightRange;
	  std::pair<double, double>	pertubationRange;
	  double			weightRandProb;
	  double			addConnectionProb;
	  double			addNodeProb;
	  double			weightMutationProb;
	};

      public:
	static void	Set(Settings const&);
	static void	Mutate(Genotype<numInputs, numOutputs>& genome);

      private:
	static void	ApplyWeightsMutation(Genotype<numInputs, numOutputs>& genome);
	static void	ApplyConnectionMutation(Genotype<numInputs, numOutputs>& genome);
	static void	ApplyNodeMutation(Genotype<numInputs, numOutputs>& genome);

      private:
	static Settings	_settings;
    };

  template<unsigned int numInputs, unsigned int numOutputs>
    typename Mutator<numInputs, numOutputs>::Settings	Mutator<numInputs, numOutputs>::_settings;

  template<unsigned int numInputs, unsigned int numOutputs> 
    void	Mutator<numInputs, numOutputs>::Set(Mutator<numInputs, numOutputs>::Settings const& settings)
    {
      _settings = settings;
    }

  template<unsigned int numInputs, unsigned int numOutputs>
    void	Mutator<numInputs, numOutputs>::Mutate(Genotype<numInputs, numOutputs>& genome)
    {
      std::random_device			rd;
      std::mt19937				gen(rd());
      std::uniform_real_distribution<double>	distrib(0, 1);

      if (distrib(gen) < _settings.weightMutationProb)
	ApplyWeightsMutation(genome);
      if (distrib(gen) < _settings.addConnectionProb)
	ApplyConnectionMutation(genome);
      if (distrib(gen) < _settings.addNodeProb)
	ApplyNodeMutation(genome);
    }

  template<unsigned int numInputs, unsigned int numOutputs>
    void	Mutator<numInputs, numOutputs>::ApplyWeightsMutation(Genotype<numInputs, numOutputs>& genome)
    {
      std::random_device			rd;
      std::mt19937				gen(rd());
      std::uniform_real_distribution<double>	distrib(0, 1);
      std::uniform_real_distribution<double>	randw(_settings.weightRange.first, _settings.weightRange.second);
      std::uniform_real_distribution<double>	randp(_settings.pertubationRange.first, _settings.pertubationRange.second);

      for (typename Genotype<numInputs, numOutputs>::Gene *gene : genome.Genes())
      {
	if (distrib(gen) < _settings.weightRandProb)
	  gene->setWeight(randw(gen));
	else
	  gene->setWeight(gene->getWeight() + randp(gen));
      }
    }

  template<unsigned int numInputs, unsigned int numOutputs>
    void	Mutator<numInputs, numOutputs>::ApplyConnectionMutation(Genotype<numInputs, numOutputs>& genome)
    {
      std::random_device				rd;
      std::mt19937					gen(rd());
      std::uniform_int_distribution<unsigned int>	randn;
      std::vector<unsigned int>				nodesIdx;
      unsigned int					input;
      unsigned int					output;
      long long						innov;

      randn = std::uniform_int_distribution<unsigned int>(0, genome.Nodes().size() - 1);
      input = genome.Nodes()[randn(gen)]->Id();

      for (typename Genotype<numInputs, numOutputs>::Node *node : genome.Nodes())
      {
	output = node->Id();
	if (node->Type() != Genotype<numInputs, numOutputs>::NodeType::INPUT
	    && std::find_if(genome.Genes().begin(), genome.Genes().end(),
	      [&](typename Genotype<numInputs, numOutputs>::Gene *gene)
	      {
	      return (gene->Input() == input && gene->Output() == output);
	      }) == genome.Genes().end())
	nodesIdx.push_back(node->Id());
      }

      if (nodesIdx.size() == 0)
	return ;

      randn = std::uniform_int_distribution<unsigned int>(0, nodesIdx.size() - 1);
      output = nodesIdx[randn(gen)];

      innov = MutationManager::GetInnovationNumber(input, output, MutationManager::MutationType::ADD_CONNECTION);
      genome.Genes().push_back(new typename Genotype<numInputs, numOutputs>::Gene(input, output, innov, _settings.weightRange));
    }

  template<unsigned int numInputs, unsigned int numOutputs>
    void	Mutator<numInputs, numOutputs>::ApplyNodeMutation(Genotype<numInputs, numOutputs>& genome)
    {
      std::random_device				rd;
      std::mt19937					gen(rd());
      std::uniform_int_distribution<unsigned int>	randn;
      unsigned int					input;
      unsigned int					output;
      long long						innov;
      typename Genotype<numInputs, numOutputs>::Node	*newNode;
      typename Genotype<numInputs, numOutputs>::Gene	*gene;
      typename Genotype<numInputs, numOutputs>::Gene	*newGene;

      randn = std::uniform_int_distribution<unsigned int>(0, genome.Genes().size() - 1);
      gene = genome.Genes()[randn(gen)];

      gene->setEnabled(false);
      input = gene->Input();
      output = gene->Output();

      newNode = genome.addNode(Genotype<numInputs, numOutputs>::NodeType::HIDDEN, _settings.weightRange);

      innov = MutationManager::GetInnovationNumber(input, newNode->Id(), MutationManager::MutationType::ADD_NODE);
      newGene = new typename Genotype<numInputs, numOutputs>::Gene(input, newNode->Id(), innov, _settings.weightRange);
      newGene->setWeight(1);
      genome.Genes().push_back(newGene);

      innov = MutationManager::GetInnovationNumber(newNode->Id(), output, MutationManager::MutationType::ADD_NODE);
      newGene = new typename Genotype<numInputs, numOutputs>::Gene(newNode->Id(), output, innov, _settings.weightRange);
      newGene->setWeight(gene->getWeight());
      genome.Genes().push_back(newGene);
    }
}

#endif /* !MUTATOR_HPP_ */
