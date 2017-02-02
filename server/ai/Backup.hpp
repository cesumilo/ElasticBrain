#pragma once

#include <string>
#include <sys/stat.h>
#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <array>
#include <string.h>

# include "Genotype.hpp"

template<unsigned int numInputs, unsigned int numOutputs>
class NeatEngine;

namespace IndieNeat
{
  using BbbGenotype = Genotype<2, 2>;

  template <unsigned int numInputs, unsigned int numOutputs>
    class Backup
    {
      public:
	Backup() = delete;

      public:
	struct	Params
	{
	  unsigned int			PopulationSize;
	  unsigned int			MaxStagnantGeneration;
	  double			DistanceThreshold;
	  double			OffspringsRate;
	  double			InterSpeciesMatingRate;
	  double			SpeciesKeepingRate;
	  unsigned int			DefaultSpeciesPoolSize;
	  std::pair<double, double>	DefaultWeightRange;
	  double			ExcessCoeficient;
	  double			DisjointCoeficient;
	  double			WeightAverageCoeficient;
	  std::pair<double, double>	DefaultPerturbationRange;
	  double			ExpectedFitness;
	  unsigned int			MaximumGeneration;
	  double			AddNeuronProbability;
	  double			AddConnectionProbability;
	  double			RandomWeightProbability;
	};

	struct	PackedGenome
	{
	  long long			numNodes;
	  double			fitness;
	  std::vector<typename Genotype<numInputs, numOutputs>::Node *>	nodes;
	  std::vector<typename Genotype<numInputs, numOutputs>::Gene *>	genes;
	};

      private:
	enum class		ParamsType
	{
	  DOUBLE,
	  UNSIGNED
	};

	struct		Parameters
	{
	  const char	*name;
	  unsigned		nbParams;
	};

	std::array<Parameters, 17> static	parameters;

      public:
	static bool		saveParams(NeatEngine<numInputs, numOutputs> const &engine)
	{
	  std::ofstream		saveFile;
	  std::string		dir = _directory + "/" + PARAMS_FILE;

	  saveFile.open(dir.c_str(), std::ios::out | std::ios::trunc);
	  if (saveFile.fail())
	  {
	    std::cerr << "Open failed" << std::endl;
	    return (false);
	  }
	  saveFile << "PopulationSize=" << std::to_string(engine.getPopulationSize()) << std::endl;
	  saveFile << "MaxStagnantGeneration=" << std::to_string(engine.getMaxStagnantGeneration()) << std::endl;
	  saveFile << "DistanceThreshold=" << std::to_string(engine.getDistanceThreshold()) << std::endl;
	  saveFile << "OffspringsRate=" << std::to_string(engine.getOffspringsRate()) << std::endl;
	  saveFile << "InterSpeciesMatingRate=" << std::to_string(engine.getInterSpeciesMatingRate()) << std::endl;
	  saveFile << "SpeciesKeepingRate=" << std::to_string(engine.getSpeciesKeepingRate()) << std::endl;
	  saveFile << "DefaultSpeciesPoolSize=" << std::to_string(engine.getDefaultSpeciesPoolSize()) << std::endl;
	  saveFile << "DefaultWeightRange=" << std::to_string(engine.getDefaultWeightRange()) << std::endl;
	  saveFile << "ExcessCoeficient=" << std::to_string(engine.getExcessCoeficient()) << std::endl;
	  saveFile << "DisjointCoeficient=" << std::to_string(engine.getDisjointCoeficient()) << std::endl;
	  saveFile << "WeightAverageCoeficient=" << std::to_string(engine.getWeightAverageCoeficient()) << std::endl;
	  saveFile << "DefaultPerturbationRange=" << std::to_string(engine.getDefaultPerturbationRange().first) << "," <<  std::to_string(engine.getDefaultPerturbationRange().second)  << std::endl;
	  saveFile << "ExpectedFitness=" << std::to_string(engine.getExpectedFitness()) << std::endl;
	  saveFile << "MaximumGeneration=" << std::to_string(engine.getMaximumGeneration()) << std::endl;
	  saveFile << "AddNeuronProbability=" << std::to_string(engine.getAddNeuronProbability()) << std::endl;
	  saveFile << "AddConnectionProbability=" << std::to_string(engine.getAddConnectionProbability()) << std::endl;
	  saveFile << "RandomWeightProbability=" << std::to_string(engine.getRandomWeightProbability()) << std::endl;
	  saveFile.close();
	  return (true);
	}

      private:
	static void		saveGenes(std::ostream &file,
	    Genotype<numInputs, numOutputs> const &genome)
	{
	  std::vector<typename Genotype<numInputs, numOutputs>::Gene *>	genes = genome.Genes();
	  bool			passed = false;

	  file << "{";
	  for (typename Genotype<numInputs, numOutputs>::Gene *gene : genes)
	  {
	    if (passed)
	      file << ";";
	    if (!passed)
	      passed = true;
	    file << "["
	      << std::to_string(gene->Input()) << ","
	      << std::to_string(gene->Output()) << ","
	      << std::to_string(gene->getIno()) << ","
	      << std::to_string(gene->isEnabled()) << ","
	      << std::to_string(gene->getWeight())
	      << "]";
	  }
	  file << "}";
	}

	static void		saveNodes(std::ostream &file,
	    Genotype<numInputs, numOutputs> &genome)
	{
	  bool			passed = false;
	  std::vector<typename Genotype<numInputs, numOutputs>::Node *>	nodes = genome.Nodes();

	  file << "{";
	  for (typename Genotype<numInputs, numOutputs>::Node *node : nodes)
	  {
	    if (passed)
	      file << ";";
	    if (!passed)
	      passed = true;
	    file << "("
	      << std::to_string(node->Id()) << ","
	      << std::to_string(static_cast<int>(node->Type())) << ","
	      << std::to_string(node->Bias())
	      << ")";
	  }
	  file << "}";
	}

      public:
	static void			encodeGenome(Genotype<numInputs, numOutputs> &genome,
	    std::string &saver)
	{
	  std::ostringstream		file;

	  file << std::to_string(genome.getNumNodes()) << "|"
	    << std::to_string(genome.getFitness()) << "|";
	  saveNodes(file, genome);
	  file << "|";
	  saveGenes(file, genome);
	  saver = file.str();
	}

	static bool		encodeGenome(Genotype<numInputs, numOutputs> &genome, std::string const &filename)
	{
	  std::ofstream		file;

	  file.open(filename.c_str(), std::ios::trunc | std::ios::out);
	  if (file.fail())
	  {
	    std::cerr << "Cannot create file `" << filename << "`." << std::endl;
	    return (false);
	  }

	  file << std::to_string(genome.getNumNodes()) << "|"
	    << std::to_string(genome.getFitness()) << "|";
	  saveNodes(file, genome);
	  file << "|";
	  saveGenes(file, genome);
	  file.close();
	  return (true);
	}

      private:
	static bool		getNNAndFitness(PackedGenome &genome,
	    std::string const &file, unsigned &i)
	{
	  unsigned		j = i;

	  while (file[i] && file[i] != '|')
	  {
	    if (!::isdigit(file[i]))
	      return (false);
	    ++i;
	  }
	  genome.numNodes = std::stoll(file.substr(j, i - j));
	  j = i + 1;
	  ++i;
	  while (file[i] && file[i] != '|')
	  {
	    if (!::isdigit(file[i]) && file[i] != '.')
	      return (false);
	    ++i;
	    }
	  if (!file[i])
	    return (false);
	  genome.fitness = std::stod(file.substr(j, i - j));
	  ++i;
	  return (true);
	}

	static std::string		getParam(std::string const &file,
	    unsigned &i)
	{
	  unsigned		j = i;

	  if (file[i] == '-')
	    ++i;
	  while (file[i] && (::isdigit(file[i]) || file[i] == '.'))
	    ++i;
	  return (file.substr(j, i - j));
	}

	static bool		getGenes(PackedGenome &genome,
	    std::string const &file, unsigned &i)
	{
	  unsigned		in;
	  unsigned		out;
	  long long		innov;
	  bool			enabled;
	  double		weight;

	  ++i;
	  if (file[i] != '{')
	    return (false);
	  i += 1;
	  while (file[i])
	  {
	    if (file[i] != '[')
	      return (false);
	    i += 1;
	    in = std::stoul(Backup<numInputs, numOutputs>::getParam(file, i));
	    if (file[i] != ',')
	      return (false);
	    ++i;
	    out = std::stoul(Backup<numInputs, numOutputs>::getParam(file, i));
	    if (file[i] != ',')
	      return (false);
	    ++i;
	    innov = std::stoll(Backup<numInputs, numOutputs>::getParam(file, i));
	    if (file[i] != ',')
	      return (false);
	    ++i;
	    enabled = std::stoi(Backup<numInputs, numOutputs>::getParam(file, i));
	    if (file[i] != ',')
	      return (false);
	    ++i;
	    weight = std::stod(Backup<numInputs, numOutputs>::getParam(file, i));
	    genome.genes.push_back(
		new typename Genotype<numInputs, numOutputs>::Gene(in, out, innov, enabled, weight));
	    if (file[i] != ']')
	      return (false);
	    i += 1;
	    if (file[i] != ';')
	      return (file[i] == '}');
	    i += 1;
	  }
	  return (true);
	}

	static bool		getNodes(PackedGenome &genome,
	    std::string const &file, unsigned &i)
	{
	  unsigned		id;
	  typename Genotype<numInputs, numOutputs>::NodeType	type;
	  double		bias;

	  if (file[i] != '{')
	    return (false);
	  i += 1;
	  while (file[i])
	  {
	    if (file[i] != '(')
	      return (false);
	    i += 1;
	    id = std::stoul(Backup<numInputs, numOutputs>::getParam(file, i));
	    if (file[i] != ',')
	      return (false);
	    ++i;
	    type = static_cast<typename Genotype<numInputs, numOutputs>::NodeType>(std::stoi(Backup<numInputs, numOutputs>::getParam(file, i)));
	    if (file[i] != ',')
	      return (false);
	    ++i;
	    bias = std::stod(Backup<numInputs, numOutputs>::getParam(file, i));
	    genome.nodes.push_back(new typename Genotype<numInputs, numOutputs>::Node(id, type, bias));
	    if (file[i] != ')')
	      return (false);
	    i += 1;
	    if (file[i] != ';')
	    {
	      if (file[i] == '}')
	      {
		++i;
		return (true);
	      }
	      return (false);
	    }
	    i += 1;
	  }
	  return (true);
	}

      public:
	static bool		decodeGenome(PackedGenome &genome, std::string const &filename)
	{
	  std::ifstream	file(filename.c_str());
	  std::string	line;
	  unsigned		i = 0;

	  if (file.fail())
	  {
	    std::cerr << "Cannot open file `" << filename << "`." << std::endl;
	    return (false);
	  }
	  std::getline(file, line);
	  if (!Backup<numInputs, numOutputs>::getNNAndFitness(genome, line, i))
	    return (false);
	  if (!Backup<numInputs, numOutputs>::getNodes(genome, line, i))
	    return (false);
	  if (!Backup<numInputs, numOutputs>::getGenes(genome, line, i))
	    return (false);
	  return (true);
	}

      public:
	static std::string const	&getDirectory()
	{
	  return Backup<numInputs, numOutputs>::_directory;
	}

	static bool			setDirectory(std::string const &dir)
	{
	  struct stat		buf;

	  if (stat(dir.c_str(), &buf) == -1)
	  {
	    std::cerr << __PRETTY_FUNCTION__ << ": " << dir << std::endl;
	    return (false);
	  }
	  if ((buf.st_mode & S_IFMT) != S_IFDIR)
	    return (false);
	  Backup<numInputs, numOutputs>::_directory = dir;
	  return (true);
	}

      private:
	static void		getParameters(std::string const &str, std::vector<std::string> &params)
	{
	  unsigned			i = 0;
	  unsigned			j = 0;

	  params.clear();
	  if (!str[0])
	    return ;
	  while (str[i])
	  {
	    if (str[i] == ',')
	    {
	      params.push_back(str.substr(j, i - j));
	      j = i + 1;
	    }
	    else if (!::isdigit(str[i]))
	    {
	      params.clear();
	      return ;
	    }
	    ++i;
	  }
	  if (i && i != j)
	    params.push_back(str.substr(j, i - j));
	}

	static void		fillElemByOffset(unsigned i, std::vector<std::string> const &value, Params &params)
	{
	  switch (i)
	  {
	    case (0):
	      params.PopulationSize = std::stoul(value[0]);
	      break ;
	    case (1):
	      params.MaxStagnantGeneration = std::stoul(value[0]);
	      break ;
	    case (2):
	      params.DistanceThreshold = std::stod(value[0]);
	      break ;
	    case (3):
	      params.OffspringsRate = std::stod(value[0]);
	      break ;
	    case (4):
	      params.InterSpeciesMatingRate = std::stod(value[0]);
	      break ;
	    case (5):
	      params.SpeciesKeepingRate = std::stod(value[0]);
	      break ;
	    case (6):
	      params.DefaultSpeciesPoolSize = std::stoul(value[0]);
	      break ;
	    case (7):
	      params.DefaultWeightRange =
		std::pair<double, double>(std::stod(value[0]), std::stod(value[1]));
	      break ;
	    case (8):
	      params.ExcessCoeficient = std::stod(value[0]);
	      break ;
	    case (9):
	      params.DisjointCoeficient = std::stod(value[0]);
	      break ;
	    case (10):
	      params.WeightAverageCoeficient = std::stod(value[0]);
	      break ;
	    case (11):
	      params.DefaultPerturbationRange =
		std::pair<double, double>(std::stod(value[0]), std::stod(value[1]));
	      break ;
	    case (12):
	      params.ExpectedFitness = std::stod(value[0]);
	      break ;
	    case (13):
	      params.MaximumGeneration = std::stoul(value[0]);
	      break ;
	    case (14):
	      params.AddNeuronProbability = std::stod(value[0]);
	      break ;
	    case (15):
	      params.AddConnectionProbability = std::stod(value[0]);
	      break ;
	    case (16):
	      params.RandomWeightProbability = std::stod(value[0]);
	      break ;
	    default :
	      throw std::runtime_error("Invalid offset");
	      break ;
	  }
	}

      public:
	static bool			getParams(Params &params)
	{
	  std::ifstream		saveFile;
	  std::string		dir = _directory + "/" + PARAMS_FILE;
	  std::string		line;
	  size_t			size = Backup<numInputs, numOutputs>::parameters.size();
	  bool			checked[17] = {false};
	  size_t			pos;
	  std::vector<std::string>	tokens;

	  saveFile.open(dir.c_str(), std::ios::in);
	  if (saveFile.fail())
	  {
	    std::cerr << "Open failed" << std::endl;
	    return (false);
	  }
	  while (getline(saveFile, line))
	  {
	    if ((pos = line.find('=')) == std::string::npos)
	      continue ;
	    std::string		token = line.substr(0, pos);

	    for (unsigned i = 0; i < size; ++i)
	    {
	      if (token.compare(Backup::parameters[i].name))
		continue ;
	      checked[i] = true;
	      Backup::getParameters(line.substr(pos + 1), tokens);
	      if (tokens.size() != Backup::parameters[i].nbParams)
		return (false);
	      Backup::fillElemByOffset(i, tokens, params);
	      break ;
	    }
	  }
	  for (bool elem : checked)
	    if (!elem)
	      return (false);
	  return (true);
	}

      private:
	static std::string		_directory;
	static std::string const	PARAMS_FILE;

    };
}
