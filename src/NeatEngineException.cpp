#include "NeatEngineException.hh"

namespace IndieNeat
{
  NeatEngineException::NeatEngineException(std::string const& msg) throw()
    : _msg(msg)
  {}

  NeatEngineException::NeatEngineException(NeatEngineException const& copy) throw()
    : _msg(copy._msg)
  {}

  NeatEngineException::~NeatEngineException(void) throw()
  {}

  NeatEngineException&	NeatEngineException::operator=(NeatEngineException const& copy) throw()
  {
    if (this == &copy)
      return (*this);

    _msg = copy._msg;
    return (*this);
  }

  const char	*NeatEngineException::what(void) const throw()
  {
    return (_msg.c_str());
  }
}
