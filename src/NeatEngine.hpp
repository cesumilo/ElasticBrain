#ifndef NEAT_ENGINE_HPP_
# define NEAT_ENGINE_HPP_

# include "Mutator.hpp"
# include "Operator.hpp"
# include "MutationManager.hh"
# include "Population.hpp"
# include "NeatEngineException.hh"
# include "Backup.hpp"

namespace IndieNeat
{
  template<unsigned int numInputs, unsigned int numOutputs>
    class NeatEngine
    {
      public:
	NeatEngine(void)
	  : _initialized(false)
	{}

	~NeatEngine(void)
	{
	  MutationManager::Clear();
	}

	void	init(void)
	{
	  Mutator<numInputs, numOutputs>::Set(_mutatorSettings);
	  Operator<numInputs, numOutputs>::Set(_operatorSettings);
	  _population.init(_popSettings);
	  _initialized = true;
	}

	void	evaluate(std::vector<typename Population<numInputs, numOutputs>::GenomeContainer *>& buffer,
	    unsigned int numberOfGenomes)
	{
	  if (!_initialized)
	    throw NeatEngineException("Neat engine not initialized !");
	  _population.evaluate(buffer, numberOfGenomes);
	}

	void	pushScore(std::vector<typename Population<numInputs, numOutputs>::GenomeScore *> const& scores)
	{
	  if (!_initialized)
	    throw NeatEngineException("Neat engine not initialized !");
	  _population.pushScore(scores);
	}

	double	getBestFitness(void) const
	{
	  if (!_initialized)
	    throw NeatEngineException("Neat engine not initialized !");
	  return (_population.getMaxFitness());
	}

	Genotype<numInputs, numOutputs>	const&	getBestGenome(void) const
	{
	  if (!_initialized)
	    throw NeatEngineException("Neat engine not initialized !");
	  return (_population.getBestGenome());
	}

	void	setPopulationSize(unsigned int size)
	{
	  _popSettings.populationSize = size;
	}

	void	setDistanceThreshold(double threshold)
	{
	  _popSettings.distanceThreshold = threshold;
	}

	void	setMaxStagnantGeneration(unsigned int number)
	{
	  _popSettings.stagnantGenerationNumber = number;
	}

	void	setOffspringsRate(double rate)
	{
	  _popSettings.offspringsRate = rate;
	}

	void  setWeightMutationProbability(double rate)
	{
	  _mutatorSettings.weightMutationProb = rate;
	}

	void	setInterSpeciesMatingRate(double rate)
	{
	  _popSettings.interSpeciesMatingRate = rate;
	}

	void	setSpeciesKeepingRate(double rate)
	{
	  _popSettings.speciesKeepingRate = rate;
	}

	void	setDefaultSpeciesPoolSize(unsigned int size)
	{
	  _popSettings.defaultPoolSize = size;
	}

	void	setDefaultWeightRange(std::pair<double, double> const& range)
	{
	  _popSettings.weightRange = range;
	  _mutatorSettings.weightRange = range;
	  _operatorSettings.weightRange = range;
	}

	void	setDefaultPerturbationRange(std::pair<double, double> const& range)
	{
	  _mutatorSettings.pertubationRange = range;
	}

	void	setExpectedFitness(double expected)
	{
	  _popSettings.expectedFitness = expected;
	}

	void	setMaximumGeneration(unsigned int size)
	{
	  _popSettings.maxGeneration = size;
	}

	void	setRandomWeightProbability(double prob)
	{
	  _mutatorSettings.weightRandProb = prob;
	}

	void	setAddConnectionProbability(double prob)
	{
	  _mutatorSettings.addConnectionProb = prob;
	}

	void	setAddNeuronProbability(double prob)
	{
	  _mutatorSettings.addNodeProb = prob;
	}

	void	setExcessCoefficient(double coef)
	{
	  _operatorSettings.excessCoef = coef;
	}

	void	setDisjointCoefficient(double coef)
	{
	  _operatorSettings.disjointCoef = coef;
	}

	void	setWeightAverageCoefficient(double coef)
	{
	  _operatorSettings.weightsAvgCoef = coef;
	}

	unsigned int	getPopulationSize(void) const
	{
	  return (_popSettings.populationSize);
	}

	double	getDistanceThreshold(void) const
	{
	  return (_popSettings.distanceThreshold);
	}

	unsigned int	getMaxStagnantGeneration(void) const
	{
	  return (_popSettings.stagnantGenerationNumber);
	}

	void  getWeightMutationProbability(void) const
	{
	  return (_mutatorSettings.weightMutationProb);
	}

	double	getOffspringsRate(void) const
	{
	  return (_popSettings.offspringsRate);
	}

	double	getInterSpeciesMatingRate(void) const
	{
	  return (_popSettings.interSpeciesMatingRate);
	}

	double	getSpeciesKeepingRate(void) const
	{
	  return (_popSettings.speciesKeepingRate);
	}

	unsigned int	getDefaultSpeciesPoolSize(void) const
	{
	  return (_popSettings.defaultPoolSize);
	}

	std::pair<double, double> const&	getDefaultWeightRange(void) const
	{
	  return (_popSettings.weightRange);
	}

	std::pair<double, double> const&	getDefaultPerturbationRange(void) const
	{
	  return (_mutatorSettings.pertubationRange);
	}

	double	getExpectedFitness(void) const
	{
	  return (_popSettings.expectedFitness);
	}

	unsigned int	getMaximumGeneration(void) const
	{
	  return (_popSettings.maxGeneration);
	}

	double	getRandomWeightProbability(void) const
	{
	  return (_mutatorSettings.weightRandProb);
	}

	double	getAddConnectionProbability(void) const
	{
	  return (_mutatorSettings.addConnectionProb);
	}

	double	getAddNeuronProbability(void) const
	{
	  return (_mutatorSettings.addNodeProb);
	}

	double	getExcessCoefficient(void) const
	{
	  return (_operatorSettings.excessCoef);
	}

	double	getDisjointCoefficient(void) const
	{
	  return (_operatorSettings.disjointCoef);
	}

	double	getWeightAverageCoefficient(void) const
	{
	  return (_operatorSettings.weightsAvgCoef);
	}

	bool	isEvolving(void) const
	{
	  if (!_initialized)
	    throw NeatEngineException("Neat engine not initialized !");
	  return (_population.isEvolving());
	}

	bool	isFinished(void) const
	{
	  if (!_initialized)
	    throw NeatEngineException("Neat engine not initialized !");
	  return (_population.isFinished());
	}

	bool  save(std::string const& directory) const
	{
	  Backup<numInputs, numOutputs>::setDirectory(directory);
	  return (_population.save());
	}

	bool  load(std::string const& directory)
	{
	  if (_initialized)
	    return (false);
	  _population.setSettings(_popSettings);
	  Mutator<numInputs, numOutputs>::Set(_mutatorSettings);
	  Operator<numInputs, numOutputs>::Set(_operatorSettings);
	  _initialized = true;
	  return (_population.load(directory));
	}

	bool  saveParameters(void)
	{
	  return (Backup<numInputs, numOutputs>::saveParams(*this));
	}

	bool  loadParameters(void)
	{
	  typename Backup<numInputs, numOutputs>::Params	params;

	  if (!Backup<numInputs, numOutputs>::getParams(params))
	    return (false);
	  setPopulationSize(params.PopulationSize);
	  setMaxStagnantGeneration(params.MaxStagnantGeneration);
	  setDistanceThreshold(params.DistanceThreshold);
	  setOffspringsRate(params.OffspringsRate);
	  setInterSpeciesMatingRate(params.InterSpeciesMatingRate);
	  setSpeciesKeepingRate(params.SpeciesKeepingRate);
	  setDefaultSpeciesPoolSize(params.DefaultSpeciesPoolSize);
	  setDefaultWeightRange(params.DefaultWeightRange);
	  setExcessCoefficient(params.ExcessCoeficient);
	  setDisjointCoefficient(params.DisjointCoeficient);
	  setWeightAverageCoefficient(params.WeightAverageCoeficient);
	  setDefaultPerturbationRange(params.DefaultPerturbationRange);
	  setExpectedFitness(params.ExpectedFitness);
	  setMaximumGeneration(params.MaximumGeneration);
	  setAddNeuronProbability(params.AddNeuronProbability);
	  setAddConnectionProbability(params.AddConnectionProbability);
	  setRandomWeightProbability(params.RandomWeightProbability);
	  return (true);
	}

      private:
	bool							_initialized;
	Population<numInputs, numOutputs>			_population;
	typename Mutator<numInputs, numOutputs>::Settings	_mutatorSettings;
	typename Operator<numInputs, numOutputs>::Settings	_operatorSettings;
	typename Population<numInputs, numOutputs>::Settings	_popSettings;
    };
}

#endif /* !NEAT_ENGINE_HPP_ */
