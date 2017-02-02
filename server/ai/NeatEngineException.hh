#ifndef NEAT_ENGINE_EXCEPTION_HH_
# define NEAT_ENGINE_EXCEPTION_HH_

# include <exception>
# include <string>

namespace IndieNeat
{
	class NeatEngineException : public std::exception
	{
		public:
			NeatEngineException(std::string const& msg) throw();
			NeatEngineException(NeatEngineException const&) throw();
			~NeatEngineException(void) throw();

			NeatEngineException&	operator=(NeatEngineException const&) throw();

			const char	*what(void) const throw();

		private:
			std::string	_msg;
	};
}

#endif /* !NEAT_ENGINE_EXCEPTION_HH_ */
