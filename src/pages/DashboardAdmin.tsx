// src/pages/DashboardAdmin.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Box,
  Flex,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  HStack,
  VStack,
  Input,
  Select,
  useToast,
  Image,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Icon,
  IconButton,
  InputGroup,
  InputLeftElement,
  Tooltip,
  useColorModeValue,
  keyframes,
  ScaleFade,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiFolder,
  FiBriefcase,
  FiLogOut,
  FiFileText,
  FiCalendar,
  FiFilter,
  FiDownload,
  FiSearch,
} from "react-icons/fi";

type Segnalazione = {
  id: number;
  data: string;
  ora: string;
  descrizione: string;
  categoria?: string;
  sala?: string;
};

type Categoria = { id: number; nome_categoria: string };
type Cliente = { id: number; nome_sala: string };

type FiltroTemporale = 
  | "tutti"
  | "oggi" 
  | "ultimi-7-giorni" 
  | "ultimi-30-giorni" 
  | "questo-mese" 
  | "mese-scorso" 
  | "personalizzato";

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export default function DashboardAdmin() {
  const { token, logout } = useAuth();
  const [segnalazioni, setSegnalazioni] = useState<Segnalazione[]>([]);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [utenti, setUtenti] = useState<any[]>([]);
  
  // Stati per i filtri
  const [filtroTemporale, setFiltroTemporale] = useState<FiltroTemporale>("tutti");
  const [dataInizio, setDataInizio] = useState("");
  const [dataFine, setDataFine] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  const toast = useToast();
  const navigate = useNavigate();

  const bgGradient = useColorModeValue(
    "linear(135deg, #667eea 0%, #764ba2 100%)",
    "linear(135deg, #4c669f 0%, #3b5998 100%)"
  );

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Carica dati
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [segRes, catRes, cliRes, uteRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/segnalazioni`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/categorie`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/clienti`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/utenti`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const segnalazioniData = await segRes.json();
      setSegnalazioni(segnalazioniData);
      setCategorie(await catRes.json());
      setClienti(await cliRes.json());
      setUtenti(await uteRes.json());

    } catch {
      toast({ 
        title: "Errore caricamento dati", 
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calcola le date in base al filtro temporale
  useEffect(() => {
    const oggi = new Date();
    let inizio: Date, fine: Date;

    switch (filtroTemporale) {
      case "oggi":
        inizio = new Date(oggi);
        fine = new Date(oggi);
        break;
      
      case "ultimi-7-giorni":
        inizio = new Date(oggi);
        inizio.setDate(oggi.getDate() - 7);
        fine = new Date(oggi);
        break;
      
      case "ultimi-30-giorni":
        inizio = new Date(oggi);
        inizio.setDate(oggi.getDate() - 30);
        fine = new Date(oggi);
        break;
      
      case "questo-mese":
        inizio = new Date(oggi.getFullYear(), oggi.getMonth(), 1);
        fine = new Date(oggi.getFullYear(), oggi.getMonth() + 1, 0);
        break;
      
      case "mese-scorso":
        inizio = new Date(oggi.getFullYear(), oggi.getMonth() - 1, 1);
        fine = new Date(oggi.getFullYear(), oggi.getMonth(), 0);
        break;
      
      case "personalizzato":
        return;
      
      case "tutti":
      default:
        setDataInizio("");
        setDataFine("");
        return;
    }

    setDataInizio(inizio.toISOString().split('T')[0]);
    setDataFine(fine.toISOString().split('T')[0]);
  }, [filtroTemporale]);

  // Filtri combinati
  const segnalazioniFiltrate = segnalazioni.filter((s) => {
    // Filtro temporale
    const dataSegnalazione = new Date(s.data);
    const dataInizioFilter = dataInizio ? new Date(dataInizio) : null;
    const dataFineFilter = dataFine ? new Date(dataFine) : null;
    
    const dataMatch = 
      (!dataInizioFilter || dataSegnalazione >= dataInizioFilter) &&
      (!dataFineFilter || dataSegnalazione <= dataFineFilter);
    
    // Altri filtri
    const catMatch = filtroCategoria ? s.categoria === filtroCategoria : true;
    const cliMatch = filtroCliente ? s.sala === filtroCliente : true;
    const searchMatch = searchTerm ? 
      s.descrizione.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.sala?.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    
    return dataMatch && catMatch && cliMatch && searchMatch;
  });

  // Esporta CSV
  const esportaCSV = () => {
    if (segnalazioniFiltrate.length === 0) {
      toast({
        title: "Nessun dato da esportare",
        status: "warning",
      });
      return;
    }

    const header = ["ID", "Data", "Ora", "Categoria", "Sala", "Descrizione"];
    const rows = segnalazioniFiltrate.map((s) => [
      s.id,
      new Date(s.data).toLocaleDateString("it-IT"),
      s.ora,
      s.categoria || "",
      s.sala || "",
      s.descrizione || "",
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].map((e) => e.join(";")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `segnalazioni_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV esportato",
      description: `${segnalazioniFiltrate.length} segnalazioni esportate`,
      status: "success",
      duration: 3000,
    });
  };

  return (
    <Box minH="100vh" bg="gray.50" position="relative">
      {/* Header - TESTO PIÙ LEGGIBILE */}
      <Box bg={bgGradient} px={6} py={4} shadow="lg">
        <Flex align="center" justify="space-between">
          <HStack spacing={4}>
            <Image 
              src="/servizinet_logo.png" 
              alt="Logo" 
              boxSize="50px" 
              borderRadius="lg"
              shadow="md"
            />
            <Box>
              <Heading size="lg" color="white" fontWeight="bold">
                Dashboard Amministratore
              </Heading>
              <Text color="white" fontSize="sm" fontWeight="medium" opacity={0.9}>
                Gestione completa del sistema
              </Text>
            </Box>
          </HStack>

          {/* Pulsanti header - TESTO PIÙ LEGGIBILE */}
          <HStack spacing={3}>
            <Button 
              colorScheme="whiteAlpha" 
              leftIcon={<FiUsers />} 
              onClick={() => navigate("/utenti")}
              color="white"
              _hover={{ bg: "whiteAlpha.300" }}
            >
              Utenti
            </Button>
            <Button 
              colorScheme="whiteAlpha" 
              leftIcon={<FiFolder />} 
              onClick={() => navigate("/categorie")}
              color="white"
              _hover={{ bg: "whiteAlpha.300" }}
            >
              Categorie
            </Button>
            <Button 
              colorScheme="whiteAlpha" 
              leftIcon={<FiBriefcase />} 
              onClick={() => navigate("/clienti")}
              color="white"
              _hover={{ bg: "whiteAlpha.300" }}
            >
              Clienti
            </Button>
            <Button 
              colorScheme="whiteAlpha" 
              leftIcon={<FiFileText />} 
              onClick={esportaCSV}
              color="white"
              _hover={{ bg: "whiteAlpha.300" }}
            >
              CSV
            </Button>
            <Button 
              colorScheme="whiteAlpha" 
              leftIcon={<FiLogOut />} 
              onClick={logout} 
              variant="outline"
              color="white"
              borderColor="whiteAlpha.500"
              _hover={{ bg: "whiteAlpha.200" }}
            >
              Logout
            </Button>
          </HStack>
        </Flex>
      </Box>

      <Box p={6}>
        {/* PRIMA RIGA: Card rettangolari per gestione */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          {[
            { 
              icon: FiUsers, 
              label: "Gestione Utenti", 
              description: "Gestisci gestione utenti del sistema", 
              color: "blue", 
              path: "/utenti" 
            },
            { 
              icon: FiFolder, 
              label: "Categorie", 
              description: "Gestisci categorie del sistema", 
              color: "purple", 
              path: "/categorie" 
            },
            { 
              icon: FiBriefcase, 
              label: "Clienti", 
              description: "Gestisci clienti del sistema", 
              color: "teal", 
              path: "/clienti" 
            },
          ].map((item, index) => (
            <ScaleFade key={item.label} in={!isLoading} initialScale={0.9} delay={0.1 * index}>
              <Card 
                bg={cardBg} 
                shadow="md" 
                border="1px" 
                borderColor={borderColor}
                _hover={{ 
                  shadow: "lg", 
                  transform: "translateY(-3px)",
                  animation: `${pulseAnimation} 0.5s ease-in-out`
                }}
                transition="all 0.3s"
                cursor="pointer"
                onClick={() => navigate(item.path)}
                minH="120px" // Più rettangolare
              >
                <CardBody>
                  <HStack spacing={4} align="start">
                    <Icon as={item.icon} boxSize={8} color={`${item.color}.500`} mt={1} />
                    <Box flex={1}>
                      <Text fontWeight="bold" color="gray.800" fontSize="lg" mb={1}>
                        {item.label}
                      </Text>
                      <Text fontSize="sm" color="gray.600" lineHeight="1.4">
                        {item.description}
                      </Text>
                    </Box>
                  </HStack>
                </CardBody>
              </Card>
            </ScaleFade>
          ))}
        </SimpleGrid>

        {/* Contatore Segnalazioni */}
        <Card bg={cardBg} shadow="sm" border="1px" borderColor={borderColor} mb={6}>
          <CardBody py={3}>
            <HStack justify="space-between">
              <Text fontSize="xl" fontWeight="bold" color="gray.700">
                {segnalazioniFiltrate.length} Segnalazioni
              </Text>
              <Button
                colorScheme="blue"
                leftIcon={<FiDownload />}
                onClick={esportaCSV}
                size="sm"
              >
                Esporta CSV
              </Button>
            </HStack>
          </CardBody>
        </Card>

        {/* Filtri e Ricerca */}
        <Card bg={cardBg} shadow="md" border="1px" borderColor={borderColor} mb={6}>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <Heading size="sm" color="gray.700">
                Filtri e Ricerca
              </Heading>
              
              <HStack spacing={4} flexWrap="wrap">
                {/* Filtro Temporale */}
                <Select
                  placeholder="Tutti i periodi"
                  value={filtroTemporale}
                  onChange={(e) => setFiltroTemporale(e.target.value as FiltroTemporale)}
                  maxW="200px"
                >
                  <option value="oggi">Oggi</option>
                  <option value="ultimi-7-giorni">Ultimi 7 giorni</option>
                  <option value="ultimi-30-giorni">Ultimi 30 giorni</option>
                  <option value="questo-mese">Questo mese</option>
                  <option value="mese-scorso">Mese scorso</option>
                  <option value="personalizzato">Personalizzato</option>
                </Select>

                {/* Input date per personalizzato */}
                {filtroTemporale === "personalizzato" && (
                  <>
                    <Input
                      type="date"
                      value={dataInizio}
                      onChange={(e) => setDataInizio(e.target.value)}
                      maxW="150px"
                    />
                    <Text color="gray.600">al</Text>
                    <Input
                      type="date"
                      value={dataFine}
                      onChange={(e) => setDataFine(e.target.value)}
                      maxW="150px"
                    />
                  </>
                )}

                {/* Search */}
                <InputGroup maxW="300px">
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FiSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Cerca nelle segnalazioni..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>

                {/* Filtri categoria e cliente */}
                <Select
                  placeholder="Tutte le categorie"
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  maxW="200px"
                >
                  {categorie.map((c) => (
                    <option key={c.id} value={c.nome_categoria}>
                      {c.nome_categoria}
                    </option>
                  ))}
                </Select>

                <Select
                  placeholder="Tutti i clienti"
                  value={filtroCliente}
                  onChange={(e) => setFiltroCliente(e.target.value)}
                  maxW="200px"
                >
                  {clienti.map((c) => (
                    <option key={c.id} value={c.nome_sala}>
                      {c.nome_sala}
                    </option>
                  ))}
                </Select>

                <Button
                  leftIcon={<FiFilter />}
                  variant="outline"
                  onClick={() => {
                    setFiltroTemporale("tutti");
                    setDataInizio("");
                    setDataFine("");
                    setFiltroCategoria("");
                    setFiltroCliente("");
                    setSearchTerm("");
                  }}
                >
                  Reset Filtri
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Tabella Segnalazioni - COLONNE RIDOTTE */}
        <Card bg={cardBg} shadow="lg" border="1px" borderColor={borderColor}>
          <CardHeader pb={0}>
            <Flex justify="space-between" align="center">
              <Heading size="md" color="gray.700">
                Segnalazioni
              </Heading>
            </Flex>
          </CardHeader>
          <CardBody>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>DATA</Th>
                    <Th>ORA</Th>
                    <Th>CATEGORIA</Th>
                    <Th>SALA</Th>
                    <Th>DESCRIZIONE</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {segnalazioniFiltrate.map((s) => (
                    <Tr 
                      key={s.id}
                      _hover={{ bg: "gray.50" }}
                      transition="background 0.2s"
                    >
                      <Td>{new Date(s.data).toLocaleDateString("it-IT")}</Td>
                      <Td>{s.ora}</Td>
                      <Td>{s.categoria || "N/A"}</Td>
                      <Td>{s.sala || "N/A"}</Td>
                      <Td maxW="400px">
                        <Tooltip label={s.descrizione}>
                          <Text noOfLines={2} fontSize="sm">
                            {s.descrizione}
                          </Text>
                        </Tooltip>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>

            {segnalazioniFiltrate.length === 0 && (
              <VStack py={10} color="gray.500">
                <Icon as={FiFilter} boxSize={8} />
                <Text>Nessuna segnalazione trovata con i filtri attuali</Text>
                <Button variant="link" onClick={() => {
                  setFiltroTemporale("tutti");
                  setFiltroCategoria("");
                  setFiltroCliente("");
                  setSearchTerm("");
                }}>
                  Ripristina filtri
                </Button>
              </VStack>
            )}
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
}
