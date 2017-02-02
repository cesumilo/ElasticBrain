#ifndef NEATPOOL_HPP_
# define NEATPOOL_HPP_

# include <utility>
# include <mutex>
# include <vector>
# include "Utils/ScopedLock.hh"


template <typename T, typename ... Args>
class NeatPool
{
  public:
    NeatPool(void) : _idx(0)
  {}

    NeatPool(unsigned nbElements, Args ... args)
      : _pool(nbElements), _idx(0), _args(args ...)
    {
      for (T *&elem : _pool)
	elem = new T(args ...);
    }

    void	init(unsigned nbElements, Args ... args)
    {
      for (unsigned i = 0; i < nbElements; i++)
	_pool.push_back(new T (args ...));
    }

    template <unsigned ... idx>
      void			buildNewObject(std::integer_sequence<unsigned, idx ...>)
      {
	_pool.push_back(new T(std::get<idx>(std::forward<std::tuple<Args ...>>(_args)) ...));
      }

    T			*get()
    {
      ScopedLock	lock(_poolMutex);
      T			*dest;

      if (_idx == _pool.size())
      {
	this->buildNewObject(std::make_integer_sequence<unsigned, sizeof...(Args)>{});
      }
      dest = _pool[_idx];
      _pool[_idx] = nullptr;
      _idx += 1;
      return (dest);
    }

    void			operator>>(T *&dest)
    {
      dest = this->get();
    }

    void		operator<<(T *water)
    {
      ScopedLock		lock(_poolMutex);

      if (_idx == 0)
	throw std::runtime_error("NeatPool already full");
      _idx -= 1;
      _pool[_idx] = water;
    }

    virtual ~NeatPool()
    {
      for (T *elem : _pool)
	delete elem;
    }

  private:
    std::vector<T *>		_pool;
    unsigned			_idx;
    std::tuple<Args ...>	_args;
    std::mutex			_poolMutex;
};

#endif /* !NEATPOOL_HPP_ */
