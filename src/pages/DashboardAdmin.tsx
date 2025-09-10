import {
  Box,
  Flex,
  Heading,
  Button,
  VStack,
  HStack,
  Text,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Input,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

// Funzione helper per formattare la data in formato italiano
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Mock segnalazioni
const mockSegnalazioni = [
  {
    id: 45,
    data: "2025-09-09",
    ora: "14:32",
    categoria: "Tecnica",
    sala: "Sala Milano",
    note: "Problema rete",
  },
  {
    id: 44,
    data: "2025-09-09",
    ora: "11:05",
    categoria: "Amministrativa",
    sala: "Sala Roma",
    note: "Errore fattura",
  },
  {
    id: 43,
    data: "2025-09-08",
    ora: "16:48",
    categoria: "Tecnica",
    sala: "Sala Torino",
    note: "Guasto PC",
  },
];

export default function DashboardAdmin() {
  const nav = useNavigate();
  const toast = useToast();
  const userEmail = "admin@tuazienda.it"; // mock, in futuro da localStorage o API

  const handleLogout = () => {
    localStorage.clear();
    toast({
      title: "Logout effettuato",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
    nav("/login");
  };

  return (
    <Flex minH="100vh" bg="gray.50" direction="column">
      {/* Header */}
      <Flex
        as="header"
        bg="brand.500"
        color="white"
        px={6}
        py={4}
        justify="space-between"
        align="center"
        shadow="sm"
      >
        <Heading size="md">Dashboard Amministratore</Heading>
        <HStack spacing={4}>
          <Text>{userEmail}</Text>
          <Button colorScheme="red" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </HStack>
      </Flex>

      {/* Contenuto */}
      <Flex flex="1" p={8} direction="column" gap={8}>
        {/* KPI */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          <Box p={6} bg="white" borderRadius="lg" shadow="md" textAlign="center">
            <Text fontSize="sm">📊 Segnalazioni Totali</Text>
            <Heading size="lg">125</Heading>
          </Box>
          <Box p={6} bg="white" borderRadius="lg" shadow="md" textAlign="center">
            <Text fontSize="sm">🏢 Clienti</Text>
            <Heading size="lg">12</Heading>
          </Box>
          <Box p={6} bg="white" borderRadius="lg" shadow="md" textAlign="center">
            <Text fontSize="sm">🗂️ Categorie</Text>
            <Heading size="lg">8</Heading>
          </Box>
          <Box p={6} bg="white" borderRadius="lg" shadow="md" textAlign="center">
            <Text fontSize="sm">👥 Utenti</Text>
            <Heading size="lg">5</Heading>
          </Box>
        </SimpleGrid>

        {/* Filtri */}
        <HStack spacing={4}>
          <Input type="date" placeholder="Filtra per data" />
          <Select placeholder="Filtra per categoria">
            <option value="tecnica">Tecnica</option>
            <option value="amministrativa">Amministrativa</option>
          </Select>
          <Select placeholder="Filtra per cliente">
            <option value="milano">Sala Milano</option>
            <option value="roma">Sala Roma</option>
            <option value="torino">Sala Torino</option>
          </Select>
        </HStack>

        {/* Tabella segnalazioni */}
        <Box bg="white" p={6} borderRadius="lg" shadow="md">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Data</Th>
                <Th>Ora</Th>
                <Th>Categoria</Th>
                <Th>Sala</Th>
                <Th>Note</Th>
              </Tr>
            </Thead>
            <Tbody>
              {mockSegnalazioni.map((s) => (
                <Tr key={s.id}>
                  <Td>{s.id}</Td>
                  <Td>{formatDate(s.data)}</Td>
                  <Td>{s.ora}</Td>
                  <Td>{s.categoria}</Td>
                  <Td>{s.sala}</Td>
                  <Td>{s.note}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Bottoni admin */}
        <HStack spacing={6} justify="center">
          <Button
            leftIcon={<span>🏢</span>}
            colorScheme="brand"
            size="lg"
            onClick={() => nav("/clienti")}
          >
            Gestione Clienti
          </Button>
          <Button
            leftIcon={<span>🗂️</span>}
            colorScheme="brand"
            size="lg"
            onClick={() => nav("/categorie")}
          >
            Gestione Categorie
          </Button>
          <Button
            leftIcon={<span>👥</span>}
            colorScheme="brand"
            size="lg"
            onClick={() => nav("/utenti")}
          >
            Gestione Utenti
          </Button>
        </HStack>

        {/* Azioni extra */}
        <HStack spacing={6} justify="center">
          <Button leftIcon={<span>⬇️</span>} colorScheme="green">
            Esporta CSV
          </Button>
          <Button leftIcon={<span>⬇️</span>} colorScheme="blue">
            Esporta PDF
          </Button>
        </HStack>
      </Flex>
    </Flex>
  );
}
