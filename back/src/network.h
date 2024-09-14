#ifndef NETWORK_H
#define NETWORK_H

#ifdef _WIN32
#include <winsock2.h>
typedef int ssize_t; // Define ssize_t for Windows
#else
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#endif

class Network {
public:
    Network(int port);
    ~Network();

    void startServer();
    void stopServer();

private:
    void handleClient(int clientSocket);

    int port;
    int serverSocket;
    bool isRunning;
};

#endif // NETWORK_H
