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
  FiBarChart2,
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
  const [totaleSegnalazioni, setTotaleSegnalazioni] = useState(0);
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
  const [paginaCorrente, setPaginaCorrente] = useState(1);
  const pageSize = 100;
  
  const toast = useToast();
  const navigate = useNavigate();

  // SFONDO HEADER BIANCO con testo nero
  const headerBg = useColorModeValue("white", "gray.800");

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Prepara i parametri per conteggio e tabella, mantenendo coerenti card e lista
  const buildSegnalazioniQueryString = (includePagination = false) => {
    const params = new URLSearchParams();

    if (dataInizio) params.append("dataInizio", dataInizio);
    if (dataFine) params.append("dataFine", dataFine);
    if (filtroCategoria) params.append("categoria", filtroCategoria);
    if (filtroCliente) params.append("sala", filtroCliente);
    if (searchTerm) params.append("search", searchTerm);

    if (includePagination) {
      params.append("limit", String(pageSize));
      params.append("offset", String((paginaCorrente - 1) * pageSize));
    }

    return params.toString();
  };

  // Carica il numero totale reale delle segnalazioni, non limitato alle prime 100 righe
  const loadTotaleSegnalazioni = async () => {
    try {
      const queryString = buildSegnalazioniQueryString();
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/segnalazioni/count${queryString ? `?${queryString}` : ""}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setTotaleSegnalazioni(data.totale || 0);
    } catch {
      toast({
        title: "Errore conteggio segnalazioni",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Carica le segnalazioni della pagina corrente, applicando i filtri lato backend
  const loadSegnalazioni = async () => {
    try {
      const queryString = buildSegnalazioniQueryString(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/segnalazioni${queryString ? `?${queryString}` : ""}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setSegnalazioni(data);
    } catch {
      toast({
        title: "Errore caricamento segnalazioni",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Carica dati
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [catRes, cliRes, uteRes] = await Promise.all([
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

      setCategorie(await catRes.json());
      setClienti(await cliRes.json());
      setUtenti(await uteRes.json());
      await loadTotaleSegnalazioni();
      await loadSegnalazioni();

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

  useEffect(() => {
    setPaginaCorrente(1);
  }, [dataInizio, dataFine, filtroCategoria, filtroCliente, searchTerm]);

  useEffect(() => {
    if (!token) return;
    loadTotaleSegnalazioni();
    loadSegnalazioni();
  }, [dataInizio, dataFine, filtroCategoria, filtroCliente, searchTerm, paginaCorrente]);

  const totalePagine = Math.max(1, Math.ceil(totaleSegnalazioni / pageSize));
  const segnalazioniFiltrate = segnalazioni;

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
      {/* Header - SFONDO BIANCO con testo NERO */}
      <Box bg={headerBg} px={6} py={4} shadow="md" borderBottom="1px" borderColor="gray.200">
        <Flex align="center" justify="space-between">
          <HStack spacing={4}>
            <Image 
              src="/servizinet_logo.png" 
              alt="Logo" 
              boxSize="50px" 
              borderRadius="lg"
            />
            <Box>
              <Heading size="lg" color="gray.800" fontWeight="bold">
                Dashboard Amministratore
              </Heading>
              <Text color="gray.600" fontSize="md" fontWeight="medium">
                Gestione completa del sistema
              </Text>
            </Box>
          </HStack>

          {/* Pulsanti header - STATISTICHE con bordi come Logout */}
          <HStack spacing={6}>
            {/* Utenti */}
            <Box 
              border="2px" 
              borderColor="blue.400"
              borderRadius="lg"
              px={4}
              py={2}
              bg="blue.50"
              textAlign="center"
              minW="100px"
            >
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                {utenti.length}
              </Text>
              <Text fontSize="md" color="blue.700" fontWeight="bold">
                Utenti
              </Text>
            </Box>
            
            {/* Clienti */}
            <Box 
              border="2px" 
              borderColor="teal.400"
              borderRadius="lg"
              px={4}
              py={2}
              bg="teal.50"
              textAlign="center"
              minW="100px"
            >
              <Text fontSize="2xl" fontWeight="bold" color="teal.600">
                {clienti.length}
              </Text>
              <Text fontSize="md" color="teal.700" fontWeight="bold">
                Clienti
              </Text>
            </Box>
            
            {/* Categorie */}
            <Box 
              border="2px" 
              borderColor="purple.400"
              borderRadius="lg"
              px={4}
              py={2}
              bg="purple.50"
              textAlign="center"
              minW="100px"
            >
              <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                {categorie.length}
              </Text>
              <Text fontSize="md" color="purple.700" fontWeight="bold">
                Categorie
              </Text>
            </Box>

            {/* Logout */}
            <Button 
              colorScheme="red"
              leftIcon={<FiLogOut />} 
              onClick={logout} 
              variant="outline"
              borderWidth="2px"
              borderColor="red.400"
              fontWeight="bold"
              _hover={{ bg: "red.50" }}
              size="lg"
            >
              Logout
            </Button>
          </HStack>
        </Flex>
      </Box>

      <Box p={6}>
        {/* PRIMA RIGA: Card Segnalazioni + Gestione */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
          {/* Card Segnalazioni */}
          <ScaleFade in={!isLoading} initialScale={0.9}>
            <Card 
              bg={cardBg} 
              shadow="lg" 
              border="1px" 
              borderColor={borderColor}
              _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
              transition="all 0.3s"
              minH="140px"
            >
              <CardBody>
                <VStack spacing={4} align="center" justify="center" height="100%">
                  <Icon as={FiBarChart2} boxSize={10} color="blue.500" />
                  <Text fontSize="4xl" fontWeight="bold" color="gray.800">
                    {totaleSegnalazioni}
                  </Text>
                  <Text fontSize="xl" fontWeight="semibold" color="gray.600">
                    Segnalazioni
                  </Text>
                  <Button
                    colorScheme="blue"
                    leftIcon={<FiDownload />}
                    onClick={esportaCSV}
                    size="md"
                    width="full"
                    mt={2}
                  >
                    Esporta CSV
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </ScaleFade>

          {/* Card Gestione Utenti */}
          <ScaleFade in={!isLoading} initialScale={0.9} delay={0.1}>
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
              onClick={() => navigate("/utenti")}
              minH="140px"
            >
              <CardBody>
                <VStack spacing={3} align="center" justify="center" height="100%">
                  <Icon as={FiUsers} boxSize={10} color="blue.500" />
                  <Text fontWeight="bold" color="gray.800" fontSize="xl" textAlign="center">
                    Gestione Utenti
                  </Text>
                  <Text fontSize="sm" color="gray.600" textAlign="center" lineHeight="1.4">
                    Gestisci gestione utenti del sistema
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </ScaleFade>

          {/* Card Categorie */}
          <ScaleFade in={!isLoading} initialScale={0.9} delay={0.2}>
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
              onClick={() => navigate("/categorie")}
              minH="140px"
            >
              <CardBody>
                <VStack spacing={3} align="center" justify="center" height="100%">
                  <Icon as={FiFolder} boxSize={10} color="purple.500" />
                  <Text fontWeight="bold" color="gray.800" fontSize="xl" textAlign="center">
                    Categorie
                  </Text>
                  <Text fontSize="sm" color="gray.600" textAlign="center" lineHeight="1.4">
                    Gestisci categorie del sistema
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </ScaleFade>

          {/* Card Clienti */}
          <ScaleFade in={!isLoading} initialScale={0.9} delay={0.3}>
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
              onClick={() => navigate("/clienti")}
              minH="140px"
            >
              <CardBody>
                <VStack spacing={3} align="center" justify="center" height="100%">
                  <Icon as={FiBriefcase} boxSize={10} color="teal.500" />
                  <Text fontWeight="bold" color="gray.800" fontSize="xl" textAlign="center">
                    Clienti
                  </Text>
                  <Text fontSize="sm" color="gray.600" textAlign="center" lineHeight="1.4">
                    Gestisci clienti del sistema
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </ScaleFade>
        </SimpleGrid>

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
                    setPaginaCorrente(1);
                  }}
                >
                  Reset Filtri
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Tabella Segnalazioni */}
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
                  setDataInizio("");
                  setDataFine("");
                  setPaginaCorrente(1);
                }}>
                  Ripristina filtri
                </Button>
              </VStack>
            )}

            {totalePagine > 1 && (
              <HStack justify="center" spacing={2} mt={6}>
                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={paginaCorrente === 1}
                  onClick={() => setPaginaCorrente((p) => Math.max(1, p - 1))}
                >
                  Precedente
                </Button>
                {Array.from({ length: totalePagine }, (_, i) => i + 1).map((pagina) => (
                  <Button
                    key={pagina}
                    size="sm"
                    colorScheme={pagina === paginaCorrente ? "blue" : undefined}
                    variant={pagina === paginaCorrente ? "solid" : "outline"}
                    onClick={() => setPaginaCorrente(pagina)}
                  >
                    {pagina}
                  </Button>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  isDisabled={paginaCorrente === totalePagine}
                  onClick={() => setPaginaCorrente((p) => Math.min(totalePagine, p + 1))}
                >
                  Successiva
                </Button>
              </HStack>
            )}
          </CardBody>
        </Card>
      </Box>
    </Box>
  );
}
