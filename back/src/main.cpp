#include "network.h"

int main() {
    Network network(8080); // Port 8080 for testing
    network.startServer();
    return 0;
}
