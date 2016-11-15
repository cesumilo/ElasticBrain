#include "Backup.hpp"

namespace IndieNeat
{
  template<> std::string		Backup<2, 2>::_directory = "";
  template<> std::string const	Backup<2, 2>::PARAMS_FILE = "engineParams.backup";
  template<> std::array<Backup<2, 2>::Parameters, 17>	Backup<2, 2>::parameters = {{
    {"PopulationSize", 1},
      {"MaxStagnantGeneration", 1},
      {"DistanceThreshold", 1},
      {"OffspringsRate", 1},
      {"InterSpeciesMatingRate", 1},
      {"SpeciesKeepingRate", 1},
      {"DefaultSpeciesPoolSize", 1},
      {"DefaultWeightRange", 2},
      {"ExcessCoeficient", 1},
      {"DisjointCoeficient", 1},
      {"WeightAverageCoeficient", 1},
      {"DefaultPerturbationRange", 2},
      {"ExpectedFitness", 1},
      {"MaximumGeneration", 1},
      {"AddNeuronProbability", 1},
      {"AddConnectionProbability", 1},
      {"RandomWeightProbability", 1},
  }};
}
