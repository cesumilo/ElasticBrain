#include <algorithm>
#include "MutationManager.hh"

namespace IndieNeat
{
  long long					MutationManager::_innov = 0;
  std::vector<MutationManager::Mutation *>	MutationManager::_mutations;

  void	MutationManager::Clear(void)
  {
    for (Mutation *mutation : _mutations)
      delete (mutation);
    _mutations.clear();
  }

  long long	MutationManager::GetInnovationNumber(unsigned int input, unsigned int output,
						    MutationType type)
  {
    std::vector<Mutation *>::iterator	it;
    Mutation				*mutate;

    if ((it = std::find_if(_mutations.begin(), _mutations.end(),
	    [&](Mutation *m)
	    {
	    return (m->input == input && m->output == output && m->type == type);
	    }
	    )) != _mutations.end())
      return ((*it)->innov);

    mutate = new Mutation;
    mutate->innov = _innov++;
    mutate->input = input;
    mutate->output = output;
    mutate->type = type;
    _mutations.push_back(mutate);

    return (mutate->innov);
  }
}
