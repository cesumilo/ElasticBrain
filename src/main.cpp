#include "NeatEngine.hpp"
#include "Phenotype.hpp"

void	evaluate_genome(IndieNeat::Population<2, 2>::GenomeContainer& genome,
    std::vector<IndieNeat::Population<2, 2>::GenomeScore *>& scores)
{
  IndieNeat::Phenotype<2, 2>	phenotype(*genome.genome);
  std::vector<double>		outputs;
  std::vector<double>		inputs1 = { 0.0, 0.0 };
  std::vector<double>		inputs2 = { 1.0, 0.0 };
  std::vector<double>		inputs3 = { 0.0, 1.0 };
  std::vector<double>		inputs4 = { 1.0, 1.0 };
  double			score = 0;
  IndieNeat::Population<2, 2>::GenomeScore	*scoreContainer;

  phenotype.init();
  outputs = phenotype.feedForward(inputs1);
  score += (outputs[0] - outputs[1] < 0 ? 0 : outputs[0] - outputs[1]);
  outputs = phenotype.feedForward(inputs2);
  score += (outputs[1] - outputs[0] < 0 ? 0 : outputs[1] - outputs[0]);
  outputs = phenotype.feedForward(inputs3);
  score += (outputs[1] - outputs[0] < 0 ? 0 : outputs[1] - outputs[0]);
  outputs = phenotype.feedForward(inputs4);
  score += (outputs[0] - outputs[1] < 0 ? 0 : outputs[0] - outputs[1]);
  scoreContainer = new IndieNeat::Population<2, 2>::GenomeScore(genome.idx, score);
  scores.push_back(scoreContainer);
}

int	main(void)
{
  IndieNeat::NeatEngine<2, 2>	engine;
  std::vector<IndieNeat::Population<2, 2>::GenomeContainer *>	buffer;
  std::vector<IndieNeat::Population<2, 2>::GenomeScore *>	scores;

  engine.setPopulationSize(150);
  engine.setMaximumGeneration(10);
  engine.setExpectedFitness(3.0);

  engine.setDefaultSpeciesPoolSize(200);
  engine.setOffspringsRate(0.75);
  engine.setSpeciesKeepingRate(0.8);
  engine.setInterSpeciesMatingRate(0.001);
  engine.setMaxStagnantGeneration(15);

  engine.setDefaultWeightRange(std::pair<double, double>(-2, 2));
  engine.setDefaultPerturbationRange(std::pair<double, double>(-5, 5));

  engine.setDistanceThreshold(0.2);
  engine.setExcessCoefficient(1);
  engine.setDisjointCoefficient(1);
  engine.setWeightAverageCoefficient(0.4);

  engine.setWeightMutationProbability(0.8);
  engine.setAddNeuronProbability(0.03);
  engine.setAddConnectionProbability(0.05);
  engine.setRandomWeightProbability(0.1);

  //engine.init();

  if (!engine.load("saves/pop_Fri_Jun__3_20_03_07_2016"))
    return (1);

  while (!engine.isFinished())
  {
    while (engine.isEvolving())
      ;
    for (unsigned int i = 0; i < engine.getPopulationSize() && !engine.isFinished(); i++)
    {
      for (auto genome : buffer)
	delete (genome);
      buffer.clear();
      engine.evaluate(buffer, 1);
      evaluate_genome(*(buffer[0]), scores);
      engine.pushScore(scores);
      scores.clear();
    }
  }

  if (!engine.save("saves"))
    std::cerr << "Error: cannot save the population." << std::endl;

  IndieNeat::Genotype<2, 2> const *best = &engine.getBestGenome();

  std::cout << "Fitness: " << best->getFitness() << std::endl;
  std::cout << "It works!" << std::endl;
  return (0);
}
