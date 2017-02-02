#ifndef OPERATOR_HPP_
# define OPERATOR_HPP_

# include <random>
# include <algorithm>
# include "Genotype.hpp"

# include <iostream>

namespace IndieNeat
{
  template<unsigned int numInputs, unsigned int numOutputs>
    class Operator
    {
      public:
	struct	Settings
	{
	  Settings(void)
	    : weightRange(std::pair<double, double>(-10, 10)),
	    excessCoef(0), disjointCoef(0),
	    weightsAvgCoef(0)
	  {}

	  Settings(Settings const &copy)
	    : weightRange(copy.weightRange),
	    excessCoef(copy.excessCoef),
	    disjointCoef(copy.disjointCoef), weightsAvgCoef(copy.weightsAvgCoef)
	  {}

	  ~Settings(void) {}

	  Settings&	operator=(Settings const& copy)
	  {
	    if (&copy == this)
	      return (*this);

	    weightRange = copy.weightRange;
	    excessCoef = copy.excessCoef;
	    disjointCoef = copy.disjointCoef;
	    weightsAvgCoef = copy.weightsAvgCoef;
	    return (*this);
	  }

	  std::pair<double, double>	weightRange;
	  double			excessCoef;
	  double			disjointCoef;
	  double			weightsAvgCoef;
	};

      public:
	static void	Set(Settings const&);

	static void	LineUp(std::vector<typename Genotype<numInputs, numOutputs>::Gene *> const& g1,
	    std::vector<typename Genotype<numInputs, numOutputs>::Gene *> const& g2,
	    std::vector<typename Genotype<numInputs, numOutputs>::Gene *>& p1,
	    std::vector<typename Genotype<numInputs, numOutputs>::Gene *>& p2);

	static Genotype<numInputs, numOutputs>	*Crossover(Genotype<numInputs, numOutputs> const& g1,
	    Genotype<numInputs, numOutputs> const& g2);

	static double	ComputeDistance(Genotype<numInputs, numOutputs> const& g1, Genotype<numInputs, numOutputs> const& g2,
	    unsigned int maxGenomeSize);

      private:
	static Settings	_settings;
    };

  template<unsigned int numInputs, unsigned int numOutputs>
    typename Operator<numInputs, numOutputs>::Settings	Operator<numInputs, numOutputs>::_settings;

  template<unsigned int numInputs, unsigned int numOutputs>
    void	Operator<numInputs, numOutputs>::Set(Operator<numInputs, numOutputs>::Settings const& settings)
    {
      _settings = settings;
    }

  template<unsigned int numInputs, unsigned int numOutputs>
    void	Operator<numInputs, numOutputs>::LineUp(std::vector<typename Genotype<numInputs, numOutputs>::Gene *> const& g1,
	std::vector<typename Genotype<numInputs, numOutputs>::Gene *> const& g2,
	std::vector<typename Genotype<numInputs, numOutputs>::Gene *>& p1,
	std::vector<typename Genotype<numInputs, numOutputs>::Gene *>& p2)
    {
      unsigned int	i = 0;
      unsigned int	j = 0;

      p1.clear();
      p2.clear();
      while (i < g1.size() || j < g2.size())
      {
	if (i < g1.size() && j < g2.size() && g1[i]->getIno() == g2[j]->getIno())
	{
	  p1.push_back(g1[i++]);
	  p2.push_back(g2[j++]);
	}
	else if (i < g1.size() && j < g2.size() && g1[i]->getIno() < g2[j]->getIno())
	{
	  p1.push_back(g1[i++]);
	  p2.push_back(NULL);
	}
	else if (i < g1.size() && j < g2.size() && g1[i]->getIno() > g2[j]->getIno())
	{
	  p1.push_back(NULL);
	  p2.push_back(g2[j++]);
	}
	else if (i < g1.size() && j >= g2.size())
	  p1.push_back(g1[i++]);
	else if (i >= g1.size() && j < g2.size())
	  p2.push_back(g2[j++]);
      }
    }

  template<unsigned int numInputs, unsigned int numOutputs>
    Genotype<numInputs, numOutputs>	*Operator<numInputs, numOutputs>::Crossover(Genotype<numInputs, numOutputs> const& g1,
	Genotype<numInputs, numOutputs> const& g2)
    {
      std::random_device						rd;
      std::mt19937							gen(rd());
      std::uniform_int_distribution<unsigned int>			distrib(0, 1);
      std::vector<typename Genotype<numInputs, numOutputs>::Gene *>	p1;
      std::vector<typename Genotype<numInputs, numOutputs>::Gene *>	p2;
      Genotype<numInputs, numOutputs>					*genome = new Genotype<numInputs, numOutputs>(_settings.weightRange);
      unsigned int							i = 0;
      unsigned int							j = 0;
      auto								it = g2.Nodes().begin();

      for (typename Genotype<numInputs, numOutputs>::Gene *gene : genome->Genes())
	delete (gene);
      for (typename Genotype<numInputs, numOutputs>::Node *node : genome->Nodes())
	delete (node);
      genome->Genes().clear();
      genome->Nodes().clear();

      LineUp(g1.Genes(), g2.Genes(), p1, p2);

      while (i < p1.size() || j < p2.size())
      {
	if (i < p1.size() && j < p2.size() && p1[i] && p2[j])
	  genome->Genes().push_back(new typename Genotype<numInputs, numOutputs>::Gene((distrib(gen) ? *p1[i] : *p2[j])));
	else if (i < p1.size() && j < p2.size() && p1[i] && !p2[j])
	  genome->Genes().push_back(new typename Genotype<numInputs, numOutputs>::Gene(*p1[i]));
	else if (i < p1.size() && j < p2.size() && !p1[i] && p2[j])
	  genome->Genes().push_back(new typename Genotype<numInputs, numOutputs>::Gene(*p2[j]));
	else if (i < p1.size() && j >= p2.size() && p1[i])
	  genome->Genes().push_back(new typename Genotype<numInputs, numOutputs>::Gene(*p1[i]));
	else if (i >= p1.size() && j < p2.size() && p2[j])
	  genome->Genes().push_back(new typename Genotype<numInputs, numOutputs>::Gene(*p2[j]));
	i++;
	j++;
      }

      for (typename Genotype<numInputs, numOutputs>::Node *node: g1.Nodes())
      {
	if ((it = std::find_if(g2.Nodes().begin(), g2.Nodes().end(),
		[&](typename Genotype<numInputs, numOutputs>::Node *n)
		{
		return (node->Id() == n->Id() && node->Type() == n->Type());
		})) != g2.Nodes().end())
	{
	  genome->Nodes().push_back(new typename Genotype<numInputs, numOutputs>::Node((distrib(gen) ? *node : *(*it))));
	}
	else
	  genome->Nodes().push_back(new typename Genotype<numInputs, numOutputs>::Node(*node));
      }

      for (typename Genotype<numInputs, numOutputs>::Node *node : g2.Nodes())
      {
	if (std::find_if(genome->Nodes().begin(), genome->Nodes().end(),
	      [&](typename Genotype<numInputs, numOutputs>::Node *n)
	      {
	      return (node->Id() == n->Id() && node->Type() == n->Type());
	      }) == genome->Nodes().end())
	{
	  genome->Nodes().push_back(new typename Genotype<numInputs, numOutputs>::Node(*node));
	}
      }
      return (genome);
    }

  template <unsigned int numInputs, unsigned int numOutputs>
    double	Operator<numInputs, numOutputs>::ComputeDistance(Genotype<numInputs, numOutputs> const& g1,
	Genotype<numInputs, numOutputs> const& g2,
	unsigned int maxGenomeSize)
    {
      std::vector<typename Genotype<numInputs, numOutputs>::Gene *>	p1;
      std::vector<typename Genotype<numInputs, numOutputs>::Gene *>	p2;
      double								numExcess = 0;
      double								numDisjoint = 0;
      unsigned int							numMatch = 0;
      double								weightDiffAvg = 0;
      unsigned int							i = 0;
      unsigned int							j = 0;

      LineUp(g1.Genes(), g2.Genes(), p1, p2);

      while (i < p1.size() || j < p2.size())
      {
	if (i < p1.size() && j < p2.size() && p1[i] && p2[j])
	{
	  weightDiffAvg += (p1[i]->getWeight() - p2[j]->getWeight());
	  numMatch += 1;
	}
	else if (i < p1.size() && j < p2.size() && p1[i] && !p2[j])
	  numDisjoint += 1;
	else if (i < p1.size() && j < p2.size() && !p1[i] && p2[j])
	  numDisjoint += 1;
	else if (i < p1.size() && j >= p2.size() && p1[i])
	  numExcess += 1;
	else if (i >= p1.size() && j < p2.size() && p2[j])
	  numExcess += 1;
	i++;
	j++;
      }
      weightDiffAvg /= numMatch;

      return ((_settings.excessCoef * numExcess / maxGenomeSize)
	  + (_settings.disjointCoef * numDisjoint / maxGenomeSize)
	  + (_settings.weightsAvgCoef * weightDiffAvg));
    }
}

#endif /* !OPERATOR_HPP_ */
