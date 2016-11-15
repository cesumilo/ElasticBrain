#ifndef MUTATION_MANAGER_HH_
# define MUTATION_MANAGER_HH_

# include <vector>

namespace IndieNeat
{
	class MutationManager
	{
		public:
			enum class			MutationType
			{
				ADD_CONNECTION,
				ADD_NODE
			};

			struct					Mutation
			{
				unsigned int	input;
				unsigned int	output;
				MutationType	type;
				long long			innov;
			};

		public:
			static void				Clear(void);
			static long long	GetInnovationNumber(unsigned int input, unsigned int output,
																						MutationType type);

		private:
			static long long								_innov;
			static std::vector<Mutation *>	_mutations;
	};
}

#endif /* !MUTATION_MANAGER_HH_ */
