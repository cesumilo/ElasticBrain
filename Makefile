CXX	= g++ -g3

RM	= rm -f

NAME	= NeatExperiment 

CXXFLAGS	+= -W -Wall -Wextra -std=c++14

LDFLAGS	= -lpthread

SRCS	= ./src/Backup.cpp \
	  ./src/MutationManager.cpp \
	  ./src/NeatEngineException.cpp \
	  ./src/ScopedLock.cpp \
	  ./src/main.cpp

OBJS	= $(SRCS:.cpp=.o)


all: $(NAME)

$(NAME): $(OBJS)
	$(CXX) -o $(NAME) $(OBJS) $(LDFLAGS)

clean:
	$(RM) $(OBJS)

fclean: clean
	$(RM) $(NAME)

re: fclean all

.PHONY: all re clean fclean
