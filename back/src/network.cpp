#include "network.h"
#include <iostream>
#include <cstring>

#ifdef _WIN32
#include <winsock2.h>
#pragma comment(lib, "Ws2_32.lib")
#else
#include <sys/socket.h>
#include <netinet/in.h>
#include <unistd.h>
#endif

Network::Network(int port) : port(port), serverSocket(-1), isRunning(false) {}

Network::~Network() {
    stopServer();
}

void Network::startServer() {
#ifdef _WIN32
    WSADATA wsaData;
    if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
        std::cerr << "Failed to initialize Winsock" << std::endl;
        return;
    }
#endif

    serverSocket = socket(AF_INET, SOCK_STREAM, 0);
    if (serverSocket == -1) {
        std::cerr << "Failed to create socket" << std::endl;
        return;
    }

    sockaddr_in serverAddr;
    std::memset(&serverAddr, 0, sizeof(serverAddr));
    serverAddr.sin_family = AF_INET;
    serverAddr.sin_port = htons(port);
    serverAddr.sin_addr.s_addr = INADDR_ANY;

    if (bind(serverSocket, (sockaddr*)&serverAddr, sizeof(serverAddr)) == -1) {
        std::cerr << "Failed to bind socket" << std::endl;
        return;
    }

    if (listen(serverSocket, 5) == -1) {
        std::cerr << "Failed to listen on socket" << std::endl;
        return;
    }

    isRunning = true;
    std::cout << "Server listening on port " << port << std::endl;

    while (isRunning) {
        int clientSocket = accept(serverSocket, nullptr, nullptr);
        if (clientSocket == -1) {
            std::cerr << "Failed to accept connection" << std::endl;
            continue;
        }
        handleClient(clientSocket);
#ifdef _WIN32
        closesocket(clientSocket);
#else
        close(clientSocket);
#endif
    }
}

void Network::handleClient(int clientSocket) {
    char buffer[1024];
    ssize_t bytesReceived = recv(clientSocket, buffer, sizeof(buffer), 0);
    if (bytesReceived > 0) {
        std::cout << "Received message: " << std::string(buffer, bytesReceived) << std::endl;
    }
}

void Network::stopServer() {
    if (serverSocket != -1) {
#ifdef _WIN32
        closesocket(serverSocket);
#else
        close(serverSocket);
#endif
        serverSocket = -1;
    }
    isRunning = false;
#ifdef _WIN32
    WSACleanup();
#endif
}
