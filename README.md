#Como correr los tests de Wasabi

## Prerequisitos
 * Docker Compose

## Building

Para levantar el entorno vamos a correr
`$ docker-compose up -d`


# De que está compuesta este entorno:
 * Cuatro nodos: un minero 1.0.0, un full 1.0.0 y 2 full 0.6.2
 * Una interfaz web3 json rpc expuesta en el puerto 4444 para cada nodo
 * Cada nodo comienza con ambos binarios copiados en el filesystem
 * Tiene la configuración de automine habilitada (+evm_mine)