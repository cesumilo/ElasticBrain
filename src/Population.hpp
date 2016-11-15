#ifndef POPULATION_HPP_
# define POPULATION_HPP_

# include <algorithm>
# include <random>
# include <thread>
# include <atomic>
# include <functional>
# include <iostream>
# include <ctime>
# include <sstream>
# include <dirent.h>
# include <sys/stat.h>

# include "Operator.hpp"
# include "Mutator.hpp"
# include "NeatPool.hpp"
# include "NeatEngineException.hh"
# include "Backup.hpp"

namespace IndieNeat
{
  template<unsigned int numInputs, unsigned int numOutputs>
    class Population
    {
      public:
	struct GenomeContainer
	{
	  GenomeContainer(unsigned int id, Genotype<numInputs, numOutputs>& g)
	    : idx(id), genome(&g)
	  {}

	  GenomeContainer(GenomeContainer const& copy)
	    : idx(copy.idx), genome(copy.genome)
	  {}

	  ~GenomeContainer(void) {}

	  GenomeContainer&	operator=(GenomeContainer const& copy)
	  {
	    if (this == &copy)
	      return (*this);

	    idx = copy.idx;
	    genome = copy.genome;
	    return (*this);
	  }

	  unsigned int				idx;
	  Genotype<numInputs, numOutputs>	*genome;
	};

	struct GenomeScore
	{
	  GenomeScore(unsigned int id, double f)
	    : idx(id), fitness(f)
	  {}

	  GenomeScore(GenomeScore const& copy)
	    : idx(copy.idx), fitness(copy.fitness)
	  {}

	  ~GenomeScore(void) {}

	  GenomeScore&	operator=(GenomeScore const& copy)
	  {
	    if (this == &copy)
	      return (*this);

	    idx = copy.idx;
	    fitness = copy.fitness;
	    return (*this);
	  }

	  unsigned int	idx;
	  double   	fitness;
	};

	struct Settings
	{
	  Settings(void)
	    : populationSize(0), distanceThreshold(0),
	    stagnantGenerationNumber(15),
	    offspringsRate(0), interSpeciesMatingRate(0), speciesKeepingRate(0),
	    defaultPoolSize(200), weightRange(std::pair<double, double>(-10, 10)),
	    expectedFitness(0), maxGeneration(0)
	  {}

	  Settings(Settings const& copy)
	    : populationSize(copy.populationSize),
	    distanceThreshold(copy.distanceThreshold),
	    stagnantGenerationNumber(copy.stagnantGenerationNumber),
	    offspringsRate(copy.offspringsRate),
	    interSpeciesMatingRate(copy.interSpeciesMatingRate),
	    speciesKeepingRate(copy.speciesKeepingRate),
	    defaultPoolSize(copy.defaultPoolSize),
	    weightRange(copy.weightRange),
	    expectedFitness(copy.expectedFitness),
	    maxGeneration(copy.maxGeneration)
	  {}

	  ~Settings(void) {}

	  Settings&	operator=(Settings const& copy)
	  {
	    if (this == &copy)
	      return (*this);

	    populationSize = copy.populationSize;
	    distanceThreshold = copy.distanceThreshold;
	    stagnantGenerationNumber = copy.stagnantGenerationNumber;
	    offspringsRate = copy.offspringsRate;
	    interSpeciesMatingRate = copy.interSpeciesMatingRate;
	    speciesKeepingRate = copy.speciesKeepingRate;
	    defaultPoolSize = copy.defaultPoolSize;
	    weightRange = copy.weightRange;
	    expectedFitness = copy.expectedFitness;
	    maxGeneration = copy.maxGeneration;
	    return (*this);
	  }

	  unsigned int			populationSize;
	  double			distanceThreshold;
	  unsigned int			stagnantGenerationNumber;
	  double			offspringsRate;
	  double			interSpeciesMatingRate;
	  double			speciesKeepingRate;
	  unsigned int			defaultPoolSize;
	  std::pair<double, double>	weightRange;
	  double			expectedFitness;
	  unsigned int			maxGeneration;
	};

	class Species
	{
	  public:
	    Species(void) {}

	    Species(Species const& copy)
	      : _ref(copy._ref), _stagnantGeneration(0), _maxFitness(0)
	    {
	      for (Genotype<numInputs, numOutputs> *genome : copy._genomes)
		_genomes.push_back(new Genotype<numInputs, numOutputs>(*genome));
	    }

	    ~Species(void) {}

	    Species&	operator=(Species const& copy)
	    {
	      _genomes.clear();
	      _ref = copy._ref;
	      _stagnantGeneration = copy._stagnantGeneration;
	      _maxFitness = copy._maxFitness;

	      for (Genotype<numInputs, numOutputs> *genome : copy._genomes)
		_genomes.push_back(new Genotype<numInputs, numOutputs>(*genome));
	    }

	    void	init(Genotype<numInputs, numOutputs>& genome)
	    {
	      _ref = genome;
	      _maxFitness = genome.getFitness();
	      _stagnantGeneration = 0;
	      _genomes.push_back(&genome);
	    }

	    void	destroy(void)
	    {
	      _genomes.clear();
	      _stagnantGeneration = 0;
	      _maxFitness = 0;
	    }

	    std::vector<Genotype<numInputs, numOutputs> *>&	Genomes(void)
	    {
	      return (_genomes);
	    }

	    Genotype<numInputs, numOutputs>&	Reference(void)
	    {
	      return (_ref);
	    }

	    void	adjustFitness(double distanceThreshold, unsigned int maxGenomeSize)
	    {
	      double	sumOfSh;

	      for (Genotype<numInputs, numOutputs> *g1 : _genomes)
	      {
		sumOfSh = 0;
		for (Genotype<numInputs, numOutputs> *g2 : _genomes)
		{
		  sumOfSh += (Operator<numInputs, numOutputs>::ComputeDistance(*g1, *g2, maxGenomeSize)
		      > distanceThreshold ? 0 : 1);
		}
		if (sumOfSh)
		  g1->setFitness(g1->getFitness() / sumOfSh);
	      }
	    }

	    unsigned int  numberOfNotEvaluated(void) const
	    {
	      unsigned int  count = 0;

	      for (Genotype<numInputs, numOutputs> *genome : _genomes)
	      {
		if (genome->getState() == Genotype<numInputs, numOutputs>::State::NOT_EVALUATED)
		  ++count;
	      }
	      return (count);
	    }

	    unsigned int  numberOfEvaluated(void) const
	    {
	      unsigned int  count = 0;

	      for (Genotype<numInputs, numOutputs> *genome : _genomes)
	      {
		if (genome->getState() == Genotype<numInputs, numOutputs>::State::IS_EVALUATED)
		  ++count;
	      }
	      return (count);
	    }

	    Genotype<numInputs, numOutputs>	*getRandomGenome(void)
	    {
	      std::random_device				rd;
	      std::mt19937					gen(rd());
	      std::uniform_int_distribution<unsigned int>	distrib(0, _genomes.size() - 1);

	      return (_genomes[distrib(gen)]);
	    }

	    void	reproduce(std::vector<Genotype<numInputs, numOutputs> *>& childs, unsigned int numOfChilds,
		double speciesKeepingRate, double interSpeciesMatingRate, Species& specie)
	    {
	      std::random_device				rd;
	      std::mt19937					gen(rd());
	      std::uniform_real_distribution<double>		distrib;
	      std::uniform_int_distribution<unsigned int>	pos;
	      unsigned int					removeSize = _genomes.size() * speciesKeepingRate;
	      std::vector<Genotype<numInputs, numOutputs> *>	keepGenome;
	      std::vector<Genotype<numInputs, numOutputs> *>	parents;
	      std::vector<double>				expecNumChild;
	      double						expectedNumChild;
	      std::vector<double>				intervals;
	      unsigned int					j = 0;
	      double						inter;
	      Genotype<numInputs, numOutputs>			*p1;
	      Genotype<numInputs, numOutputs>			*p2;
	      
	      if (_genomes.size() == 0)
		return ;

	      std::sort(_genomes.begin(), _genomes.end(),
		  [](Genotype<numInputs, numOutputs> *g1, Genotype<numInputs, numOutputs> *g2)
		  {
		  return (g1->getFitness() > g2->getFitness());
		  });

	      for (unsigned int i = 0; i < _genomes.size() - removeSize; i++)
		keepGenome.push_back(_genomes[i]);

	      _genomes.clear();
	      _genomes = keepGenome;

	      for (Genotype<numInputs, numOutputs> *g1 : _genomes)
	      {
		expectedNumChild = 0;
		for (Genotype<numInputs, numOutputs> *g2 : _genomes)
		{
		  if (g2 != g1)
		    expectedNumChild += g2->getFitness();
		}
		expecNumChild.push_back(numOfChilds / expectedNumChild * g1->getFitness());

		if (!intervals.size())
		  intervals.push_back(expecNumChild.back());
		else
		  intervals.push_back(intervals.back() + expecNumChild.back());
	      }

	      for (unsigned int i = 0; i < numOfChilds; i++)
	      {
		distrib = std::uniform_real_distribution<double>(0, intervals.back());
		inter = distrib(gen);

		j = 0;
		while (j < intervals.size() && inter > intervals[j])
		  j++;

		p1 = _genomes[j];

		distrib = std::uniform_real_distribution<double>(0, 1);
		if (distrib(gen) <= interSpeciesMatingRate)
		  p2 = specie.getRandomGenome();
		else
		{
		  distrib = std::uniform_real_distribution<double>(0, intervals.back());
		  inter = distrib(gen);

		  j = 0;
		  while (j < intervals.size() && inter > intervals[j])
		    j++;

		  p2 = _genomes[j];
		}
		childs.push_back(Operator<numInputs, numOutputs>::Crossover(*p1, *p2));
	      }
	    }

	    void	evaluate(std::vector<Genotype<numInputs, numOutputs>* >& buffer,
		unsigned int numberOfGenomes)
	    {
	      for (Genotype<numInputs, numOutputs> *genome : _genomes)
	      {
		if (genome->getState() == Genotype<numInputs, numOutputs>::State::NOT_EVALUATED
		    && numberOfGenomes)
		{
		  buffer.push_back(genome);
		  numberOfGenomes--;
		}
	      }
	    }

	    void  setStagnantGeneration(unsigned int gen)
	    {
	      _stagnantGeneration = gen;
	    }

	    unsigned int  getStagnantGeneration(void) const
	    {
	      return (_stagnantGeneration);
	    }

	    double  getStagnantFitness(void) const
	    {
	      return (_maxFitness);
	    }

	    void  setStagnantFitness(double fit)
	    {
	      _maxFitness = fit;
	    }

	  private:
	    Genotype<numInputs, numOutputs>		    _ref;
	    unsigned int				    _stagnantGeneration;
	    double					    _maxFitness;
	    std::vector<Genotype<numInputs, numOutputs> *>  _genomes;
	};

      public:
	Population(void) : _evolver(NULL) {}

	Population(Settings const& settings)
	  : _settings(settings), _pool(settings.defaultPoolSize),
	  _inEvolution(false), _isFinished(false), _generation(0), _evolver(NULL)
	{
	  for (unsigned int i = 0; i < _settings.populationSize; i++)
	    _genomes.push_back(new Genotype<numInputs, numOutputs>(_settings.weightRange));
	  for (Genotype<numInputs, numOutputs> *genome : _genomes)
	    addGenotype(*genome);
	}

	Population(Population const& copy)
	  : _settings(copy._settings), _pool(copy._settings.defaultPoolSize),
	  _inEvolution(false), _isFinished(false), _generation(0), _evolver(NULL)
	{
	  for (Genotype<numInputs, numOutputs> *genome : copy._genomes)
	    _genomes.push_back(new Genotype<numInputs, numOutputs>(*genome));
	  for (Genotype<numInputs, numOutputs> *genome : _genomes)
	    addGenotype(*genome);
	}

	~Population(void)
	{
	  for (Genotype<numInputs, numOutputs> *genome : _genomes)
	    delete (genome);
	  for (Species *specie : _species)
	  {
	    specie->destroy();
	    _pool << specie;
	  }
	  _species.clear();
	  _genomes.clear();
	  if (_evolver && _evolver->joinable())
	    _evolver->join();
	  delete (_evolver);
	}

	Population&	operator=(Population const& copy)
	{
	  if (this == &copy)
	    return (*this);

	  _settings = copy._settings;
	  _inEvolution = copy._inEvolution;
	  _isFinished = copy._isFinished;
	  _generation = copy._generation;
	  _evolver = NULL;
	  for (Genotype<numInputs, numOutputs> *genome : _genomes)
	    delete (genome);
	  for (Species *specie : _species)
	  {
	    specie->destroy();
	    _pool << specie;
	  }
	  _species.clear();
	  _genomes.clear();

	  for (Genotype<numInputs, numOutputs> *genome : copy._genomes)
	    _genomes.push_back(new Genotype<numInputs, numOutputs>(*genome));
	  for (Genotype<numInputs, numOutputs> *genome : _genomes)
	    addGenotype(*genome);
	  return (*this);
	}

	void	init(Settings const& settings)
	{
	  _settings = settings;
	  _isFinished = false;
	  _inEvolution = false;
	  _pool.init(settings.defaultPoolSize);
	  _generation = 0;
	  _evolver = NULL;
	  for (unsigned int i = 0; i < _settings.populationSize; i++)
	    _genomes.push_back(new Genotype<numInputs, numOutputs>(_settings.weightRange));
	  for (Genotype<numInputs, numOutputs> *genome : _genomes)
	    addGenotype(*genome);
	}

	void  setSettings(Settings const& settings)
	{
	  _settings = settings;
	}

	std::vector<Genotype<numInputs, numOutputs> *> const&	Genomes(void) const
	{
	  if (_inEvolution)
	    throw NeatEngineException("action not permitted, currently in evolution.");
	  return (_genomes);
	}

	void	evaluate(std::vector<GenomeContainer *>& buffer, unsigned int numOfGenomes)
	{
	  if (_inEvolution || _isFinished)
	    return ;

	  typename std::vector<Species *>::iterator it = _species.begin();
	  std::vector<Genotype<numInputs, numOutputs> *>  genomes;
	  unsigned int	i = 0;

	  while (it != _species.end() && (*it)->numberOfNotEvaluated() < numOfGenomes)
	    it++;

	  if (it != _species.end())
	  {
	    (*it)->evaluate(genomes, numOfGenomes);
	    for (Genotype<numInputs, numOutputs> *g : genomes)
	    {
	      i = 0;
	      while (i < _genomes.size() && _genomes[i] != g)
		++i;
	      g->setState(Genotype<numInputs, numOutputs>::State::IN_EVALUATION);
	      buffer.push_back(new GenomeContainer(i, *g));
	    }
	  }
	  else
	  {
	    it = _species.begin();
	    while (it != _species.end() && (*it)->numberOfNotEvaluated() == 0)
	      it++;

	    if (it != _species.end())
	    {
	      (*it)->evaluate(genomes, numOfGenomes);
	      for (Genotype<numInputs, numOutputs> *g : genomes)
	      {
		i = 0;
		while (i < _genomes.size() && _genomes[i] != g)
		  ++i;
		g->setState(Genotype<numInputs, numOutputs>::State::IN_EVALUATION);
		buffer.push_back(new GenomeContainer(i, *g));
	      }
	      for (unsigned int j = genomes.size(); j < numOfGenomes; j++)
		buffer.push_back(new GenomeContainer(*buffer.back()));
	    }
	  }
	}

	void	pushScore(std::vector<GenomeScore *> const& scores)
	{
	  unsigned int	i = 0;

	  if (_isFinished)
	    throw NeatEngineException("the population is currently finished.");
	  if (_inEvolution)
	    throw NeatEngineException("the population is currently evolving.");

	  for (GenomeScore *score : scores)
	  {
	    if (score->fitness < 0)
	      _genomes[score->idx]->setState(Genotype<numInputs, numOutputs>::State::NOT_EVALUATED);
	    else
	    {
	      _genomes[score->idx]->setFitness(score->fitness);
	      _genomes[score->idx]->setState(Genotype<numInputs, numOutputs>::State::IS_EVALUATED);
	    }
	    delete (score);
	  }

	  while (i < _genomes.size() && _genomes[i]->getState()
	      == Genotype<numInputs, numOutputs>::State::IS_EVALUATED)
	    i++;

	  if (i == _genomes.size())
	  {
	    _inEvolution = true;
	    if (_evolver && _evolver->joinable())
	      _evolver->join();
	    delete (_evolver);
	    _evolver = new std::thread([&](){ this->evolve(); });
	  }
	}

	double	getMaxFitness(void) const
	{
	  double	maxFitness = 0;

	  if (_inEvolution)
	    return (maxFitness);

	  for (Genotype<numInputs, numOutputs> *genome : _genomes)
	  {
	    if (genome->getFitness() > maxFitness)
	      maxFitness = genome->getFitness();
	  }
	  return (maxFitness);
	}

	Genotype<numInputs, numOutputs> const&	getBestGenome(void) const
	{
	  Genotype<numInputs, numOutputs>	*best;
	  double				maxFitness = 0;

	  if (_inEvolution)
	    throw NeatEngineException("action not permitted, currently in evolution.");

	  for (Genotype<numInputs, numOutputs> *genome : _genomes)
	  {
	    if (genome->getFitness() > maxFitness)
	    {
	      maxFitness = genome->getFitness();
	      best = genome;
	    }
	  }
	  return (*best);
	}

	bool	isEvolving(void) const
	{
	  return (_inEvolution);
	}

	bool	isFinished(void) const
	{
	  return (_isFinished);
	}

	bool  save(void) const
	{
	  std::string	directory(Backup<numInputs, numOutputs>::getDirectory());
	  unsigned int	count = 0;
	  struct stat	dir_info;

	  if (::stat(directory.c_str(), &dir_info) == -1 && mkdir(directory.c_str(), 0777) == -1)
	    return (false);

	  if ((dir_info.st_mode & S_IFMT) != S_IFDIR)
	    return (false);

	  time_t rawtime;
	  struct tm * timeinfo;
	  time ( &rawtime );
	  timeinfo = localtime ( &rawtime );
	  std::string timer(asctime(timeinfo));
	  timer.erase(timer.size() - 1);

	  directory = directory + std::string("/pop_") + timer;
	  std::replace_if(directory.begin(), directory.end(), [](char c) { return (c == ' ' || c == ':'); }, '_');

	  if (mkdir(directory.c_str(), 0777) == -1)
	    return (false);

	  for (Genotype<numInputs, numOutputs> *genome : _genomes)
	  {
	    std::stringstream ss;
	    ss << directory << "/genome_" << count << ".dat";
	    if (!Backup<numInputs, numOutputs>::encodeGenome(*genome, ss.str()))
	      return (false);
	    ++count;
	  }
	  return (true);
	}

	bool  load(std::string const& dirname)
	{
	  DIR *dir = ::opendir(dirname.c_str());
	  struct dirent	*info;
	  typename Backup<numInputs, numOutputs>::PackedGenome packet;
	  Genotype<numInputs, numOutputs> *newGenome;

	  if (!dir)
	  {
	    std::cerr << "cannot open directory " << dirname << std::endl;
	    return (false);
	  }

	  _isFinished = false;
	  _inEvolution = false;
	  _pool.init(_settings.defaultPoolSize);
	  _generation = 0;
	  _evolver = NULL;

	  for (Genotype<numInputs, numOutputs> *genome : _genomes)
	    delete (genome);
	  for (Species *specie : _species)
	  {
	    specie->destroy();
	    _pool << specie;
	  }
	  _species.clear();
	  _genomes.clear();

	  while ((info = readdir(dir)))
	  {
	    if (::strlen(info->d_name) > 4
		&& !::strcmp(&(info->d_name[::strlen(info->d_name) - 4]), ".dat"))
	    {
	      std::stringstream	ss;
	      ss << dirname << "/" << info->d_name;
	      if (Backup<numInputs, numOutputs>::decodeGenome(packet, ss.str()) == false)
	      {
		closedir(dir);
		std::cerr << "cannot decode genome : " << ss.str() << std::endl;
		return (false);
	      }
	      newGenome = new Genotype<numInputs, numOutputs>();
	      newGenome->setFitness(packet.fitness);
	      newGenome->setNumNodes(packet.numNodes);
	      newGenome->setState(Genotype<numInputs, numOutputs>::State::NOT_EVALUATED);
	      for (typename Genotype<numInputs, numOutputs>::Gene *gene : packet.genes)
		newGenome->Genes().push_back(gene);
	      for (typename Genotype<numInputs, numOutputs>::Node *node : packet.nodes)
		newGenome->Nodes().push_back(node);
	      _genomes.push_back(newGenome);
	      packet.nodes.clear();
	      packet.genes.clear();
	    }
	  }

	  closedir(dir);

	  for (Genotype<numInputs, numOutputs> *genome : _genomes)
	    addGenotype(*genome);
	  return (true);
	}

      private:
	double	_getMaxFitness(void) const
	{
	  double	maxFitness = 0;

	  for (Genotype<numInputs, numOutputs> *genome : _genomes)
	  {
	    if (genome->getFitness() > maxFitness)
	      maxFitness = genome->getFitness();
	  }
	  return (maxFitness);
	}

	void	evolve(void)
	{
	  for (Species *specie : _species)
	    specie->adjustFitness(_settings.distanceThreshold, this->getMaxGenomeSize());

	  // LOG
	  time_t rawtime;
	  struct tm * timeinfo;
	  time ( &rawtime );
	  timeinfo = localtime ( &rawtime );
	  std::string timer(asctime(timeinfo));
	  timer[timer.size() - 1] = '\0';

	  std::cout << "[" << timer << "][INFO] Best fitness: " << _getMaxFitness() << std::endl;
	  std::cout << "[" << timer << "][INFO] Population size: " << _genomes.size() << std::endl;
	  std::cout << "[" << timer << "][INFO] Number of species: " << _species.size() << std::endl;
	  std::cout << "[" << timer << "][INFO] Generation: " << _generation << std::endl << std::endl;
	  // END OF LOG.

	  if ((_settings.maxGeneration > 0 && _generation == _settings.maxGeneration)
	      || (_settings.expectedFitness > 0 && this->_getMaxFitness() >= _settings.expectedFitness))
	    _isFinished = true;
	  else 
	  {
	    this->reproduce();
	    this->mutate();
	    ++_generation;
	  }
	  _inEvolution = false;
	}

	unsigned int	getMaxGenomeSize(void) const
	{
	  unsigned int	maxSize = 0;

	  for (Genotype<numInputs, numOutputs> *genome : _genomes)
	  {
	    if (maxSize < genome->Genes().size())
	      maxSize = genome->Genes().size();
	  }
	  return (maxSize);
	}

	void	addGenotype(Genotype<numInputs, numOutputs>& genome)
	{
	  typename std::vector<Species *>::iterator it = _species.begin();
	  Species				    *newSpecie;

	  while (it != _species.end()
	      && Operator<numInputs, numOutputs>::ComputeDistance((*it)->Reference(), genome, getMaxGenomeSize())
	      < _settings.distanceThreshold)
	    it++;

	  if (it != _species.end())
	    (*it)->Genomes().push_back(&genome);
	  else
	  {
	    _pool >> newSpecie;
	    newSpecie->init(genome);
	    _species.push_back(newSpecie);
	  }
	}

	void	mutate(void)
	{
	  for (Genotype<numInputs, numOutputs> *genome : _genomes)
	    Mutator<numInputs, numOutputs>::Mutate(*genome);
	}

	void	reproduce(void)
	{
	  std::random_device				 	rd;
	  std::mt19937						gen(rd());
	  std::uniform_int_distribution<unsigned int>		distrib(0, _species.size() - 1);
	  std::vector<Genotype<numInputs, numOutputs> *>	keepedGenomes;
	  std::vector<Genotype<numInputs, numOutputs> *>	childs;
	  unsigned int						numOfChilds = _genomes.size() * _settings.offspringsRate;
	  unsigned int						keepingSize = _genomes.size() - numOfChilds;
	  double						totalFit = 0;
	  std::vector<unsigned int>				numChilds;
	  unsigned int						popSize = numOfChilds;
	  std::vector<unsigned int>				speciesIdx;
	  unsigned int						j;
	  unsigned int						totalNumOfGenomes = 0;

	  std::sort(_genomes.begin(), _genomes.end(),
	      [](Genotype<numInputs, numOutputs> *g1, Genotype<numInputs, numOutputs> *g2)
	      {
	      return (g1->getFitness() > g2->getFitness());
	      });

	  for (unsigned int i = 0; i < _species.size(); i++)
	  {
	    if (_species[i]->Genomes().size() > 0)
	    {
	      distrib = std::uniform_int_distribution<unsigned int>(0, _species[i]->Genomes().size() - 1);
	      _species[i]->Reference() = *_species[i]->Genomes()[distrib(gen)];
	      if (_species[i]->Reference().getFitness() > _species[i]->getStagnantFitness())
	      {
		_species[i]->setStagnantFitness(_species[i]->Reference().getFitness());
		_species[i]->setStagnantGeneration(0);
	      }
	      else
		_species[i]->setStagnantGeneration(_species[i]->getStagnantGeneration() + 1);
	    }
	    else
	      _species[i]->setStagnantGeneration(0);
	  }

	  for (unsigned int i = 0; i < keepingSize; i++)
	    keepedGenomes.push_back(_genomes[i]);

	  for (unsigned int i = 0; i < _species.size(); i++)
	  {
	    if (_species[i]->getStagnantGeneration() >= _settings.stagnantGenerationNumber)
	      _species[i]->Genomes().clear();
	    if (_species[i]->Genomes().size() > 0)
	      totalFit += _species[i]->Reference().getFitness();
	  }

	  for (unsigned int i = 0; i < _species.size(); i++)
	  {
	    if (_species[i]->Genomes().size() > 0)
	    {
	      if ((_species[i]->Reference().getFitness() / totalFit) * numOfChilds < 0)
		numChilds.push_back(0);
	      else
	      {
		numChilds.push_back(static_cast<unsigned int>((_species[i]->Reference().getFitness()
			/ totalFit) * numOfChilds));
	      }

	      if (popSize >= numChilds.back())
		popSize -= numChilds.back();
	      else
		popSize = 0;
	      speciesIdx.push_back(i);
	    }
	  }

	  distrib = std::uniform_int_distribution<unsigned int>(0, numChilds.size() - 1);
	  while (popSize > 0)
	  {
	    numChilds[distrib(gen)] += 1;
	    --popSize;
	  }

	  for (unsigned int i = 0; i < numChilds.size(); i++)
	    totalNumOfGenomes += numChilds[i];

	  distrib = std::uniform_int_distribution<unsigned int>(0, numChilds.size() - 1);
	  while (totalNumOfGenomes + keepedGenomes.size() < _settings.populationSize)
	  {
	    numChilds[distrib(gen)] += 1;
	    ++totalNumOfGenomes;
	  }

	  j = 0;
	  for (unsigned int i = 0; i < _species.size(); i++)
	  {
	    distrib = std::uniform_int_distribution<unsigned int>(0, speciesIdx.size() - 1);
	    if (_species[i]->Genomes().size() > 0)
	    {
	      _species[i]->reproduce(childs, numChilds[j], _settings.speciesKeepingRate,
		  _settings.interSpeciesMatingRate, *_species[speciesIdx[distrib(gen)]]);
	      ++j;
	    }
	  }

	  for (Species *specie : _species)
	    specie->Genomes().clear();

	  for (unsigned int i = keepingSize; i < _genomes.size(); i++)
	    delete (_genomes[i]);

	  _genomes.clear();
	  for (Genotype<numInputs, numOutputs> *genome : keepedGenomes)
	    _genomes.push_back(genome);

	  for (Genotype<numInputs, numOutputs> *genome : childs)
	    _genomes.push_back(genome);

	  for (Genotype<numInputs, numOutputs> *genome : _genomes)
	  {
	    genome->setState(Genotype<numInputs, numOutputs>::State::NOT_EVALUATED);
	    addGenotype(*genome);
	  }
	}

	// TODO: Save.
	// TODO: Load.

      private:
	Settings					_settings;
	NeatPool<Species>				_pool;
	std::atomic<bool>				_inEvolution;
	std::atomic<bool>				_isFinished;
	unsigned int					_generation;
	std::thread					*_evolver;
	std::vector<Species *>				_species;
	std::vector<Genotype<numInputs, numOutputs> *>	_genomes;
    };
}

# include "Genotype.hpp"

#endif /* !POPULATION_HPP_ */
