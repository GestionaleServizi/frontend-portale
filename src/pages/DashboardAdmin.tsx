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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Badge,
  IconButton,
  InputGroup,
  InputLeftElement,
  InputRightElement,
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
  FiPlus,
  FiSearch,
  FiTrendingUp,
  FiEye,
  FiMoreVertical,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiBarChart2,
} from "react-icons/fi";

type Segnalazione = {
  id: number;
  data: string;
  ora: string;
  descrizione: string;
  categoria?: string;
  sala?: string;
  priorita?: "alta" | "media" | "bassa";
  stato?: "aperta" | "in_lavorazione" | "risolta";
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
        // L'utente imposterà manualmente dataInizio e dataFine
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

  // Statistiche calcolate
  const segnalazioniAperte = segnalazioni.filter(s => s.stato === "aperta").length;
  const segnalazioniInLavorazione = segnalazioni.filter(s => s.stato === "in_lavorazione").length;
  const segnalazioniRisolte = segnalazioni.filter(s => s.stato === "risolta").length;
  const segnalazioniUrgenti = segnalazioni.filter(s => s.priorita === "alta").length;

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

    const header = ["ID", "Data", "Ora", "Categoria", "Sala", "Descrizione", "Priorità", "Stato"];
    const rows = segnalazioniFiltrate.map((s) => [
      s.id,
      new Date(s.data).toLocaleDateString("it-IT"),
      s.ora,
      s.categoria || "",
      s.sala || "",
      s.descrizione || "",
      s.priorita || "",
      s.stato || "",
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].map((e) => e.join(";")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    
    // Nome file con info sul periodo
    const periodo = filtroTemporale !== "tutti" ? filtroTemporale : "completo";
    link.setAttribute("download", `segnalazioni_${periodo}_${new Date().toISOString().split('T')[0]}.csv`);
    
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

  const getPriorityColor = (priorita?: string) => {
    switch (priorita) {
      case "alta": return "red";
      case "media": return "orange";
      case "bassa": return "green";
      default: return "gray";
    }
  };

  const getStatusColor = (stato?: string) => {
    switch (stato) {
      case "aperta": return "blue";
      case "in_lavorazione": return "purple";
      case "risolta": return "green";
      default: return "gray";
    }
  };

  const getStatusIcon = (stato?: string) => {
    switch (stato) {
      case "aperta": return FiAlertCircle;
      case "in_lavorazione": return FiClock;
      case "risolta": return FiCheckCircle;
      default: return FiEye;
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" position="relative">
      {/* Header */}
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
              <Text color="whiteAlpha.800" fontSize="sm">
                Gestione completa del sistema
              </Text>
            </Box>
          </HStack>

          {/* Pulsanti originali */}
          <HStack spacing={3}>
            <Button colorScheme="whiteAlpha" leftIcon={<FiUsers />} onClick={() => navigate("/utenti")}>
              Utenti
            </Button>
            <Button colorScheme="whiteAlpha" leftIcon={<FiFolder />} onClick={() => navigate("/categorie")}>
              Categorie
            </Button>
            <Button colorScheme="whiteAlpha" leftIcon={<FiBriefcase />} onClick={() => navigate("/clienti")}>
              Clienti
            </Button>
            <Button colorScheme="whiteAlpha" leftIcon={<FiFileText />} onClick={esportaCSV}>
              CSV
            </Button>
            <Button colorScheme="whiteAlpha" leftIcon={<FiLogOut />} onClick={logout} variant="outline">
              Logout
            </Button>
          </HStack>
        </Flex>
      </Box>

      <Box p={6}>
        {/* KPI Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          <ScaleFade in={!isLoading} initialScale={0.9}>
            <Card 
              bg={cardBg} 
              shadow="lg" 
              border="1px" 
              borderColor={borderColor}
              _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
              transition="all 0.3s"
            >
              <CardBody>
                <Stat>
                  <StatLabel display="flex" alignItems="center" gap={2} color="gray.600">
                    <Icon as={FiBarChart2} color="blue.500" />
                    Totale Segnalazioni
                  </StatLabel>
                  <StatNumber color="blue.600" fontSize="3xl">
                    {segnalazioniFiltrate.length}
                  </StatNumber>
                  <StatHelpText>
                    <Text color="green.500" display="flex" alignItems="center" gap={1}>
                      <FiTrendingUp /> Filtrate
                    </Text>
                  </StatHelpText>
                </Stat>
                <Progress 
                  value={(segnalazioniFiltrate.length / segnalazioni.length) * 100} 
                  colorScheme="blue" 
                  mt={2} 
                  size="sm" 
                  borderRadius="full" 
                />
              </CardBody>
            </Card>
          </ScaleFade>

          <ScaleFade in={!isLoading} initialScale={0.9} delay={0.1}>
            <Card 
              bg={cardBg} 
              shadow="lg" 
              border="1px" 
              borderColor={borderColor}
              _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
              transition="all 0.3s"
            >
              <CardBody>
                <Stat>
                  <StatLabel display="flex" alignItems="center" gap={2} color="gray.600">
                    <Icon as={FiAlertCircle} color="red.500" />
                    Segnalazioni Aperte
                  </StatLabel>
                  <StatNumber color="red.600" fontSize="3xl">
                    {segnalazioniAperte}
                  </StatNumber>
                  <StatHelpText>
                    {segnalazioniUrgenti} urgenti
                  </StatHelpText>
                </Stat>
                <Progress 
                  value={(segnalazioniAperte / segnalazioni.length) * 100} 
                  colorScheme="red" 
                  mt={2} 
                  size="sm" 
                  borderRadius="full" 
                />
              </CardBody>
            </Card>
          </ScaleFade>

          <ScaleFade in={!isLoading} initialScale={0.9} delay={0.2}>
            <Card 
              bg={cardBg} 
              shadow="lg" 
              border="1px" 
              borderColor={borderColor}
              _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
              transition="all 0.3s"
            >
              <CardBody>
                <Stat>
                  <StatLabel display="flex" alignItems="center" gap={2} color="gray.600">
                    <Icon as={FiClock} color="purple.500" />
                    In Lavorazione
                  </StatLabel>
                  <StatNumber color="purple.600" fontSize="3xl">
                    {segnalazioniInLavorazione}
                  </StatNumber>
                  <StatHelpText>
                    In corso
                  </StatHelpText>
                </Stat>
                <Progress 
                  value={(segnalazioniInLavorazione / segnalazioni.length) * 100} 
                  colorScheme="purple" 
                  mt={2} 
                  size="sm" 
                  borderRadius="full" 
                />
              </CardBody>
            </Card>
          </ScaleFade>

          <ScaleFade in={!isLoading} initialScale={0.9} delay={0.3}>
            <Card 
              bg={cardBg} 
              shadow="lg" 
              border="1px" 
              borderColor={borderColor}
              _hover={{ shadow: "xl", transform: "translateY(-2px)" }}
              transition="all 0.3s"
            >
              <CardBody>
                <Stat>
                  <StatLabel display="flex" alignItems="center" gap={2} color="gray.600">
                    <Icon as={FiCheckCircle} color="green.500" />
                    Risolte
                  </StatLabel>
                  <StatNumber color="green.600" fontSize="3xl">
                    {segnalazioniRisolte}
                  </StatNumber>
                  <StatHelpText>
                    Completate
                  </StatHelpText>
                </Stat>
                <Progress 
                  value={(segnalazioniRisolte / segnalazioni.length) * 100} 
                  colorScheme="green" 
                  mt={2} 
                  size="sm" 
                  borderRadius="full" 
                />
              </CardBody>
            </Card>
          </ScaleFade>
        </SimpleGrid>

        {/* Quick Access Cards */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          {[
            { icon: FiUsers, label: "Gestione Utenti", count: utenti.length, color: "blue", path: "/utenti" },
            { icon: FiFolder, label: "Categorie", count: categorie.length, color: "purple", path: "/categorie" },
            { icon: FiBriefcase, label: "Clienti", count: clienti.length, color: "teal", path: "/clienti" },
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
              >
                <CardBody>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Icon as={item.icon} boxSize={6} color={`${item.color}.500`} />
                      <Badge colorScheme={item.color} variant="subtle">
                        {item.count}
                      </Badge>
                    </HStack>
                    <Text fontWeight="semibold" color="gray.700">
                      {item.label}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Gestisci {item.label.toLowerCase()} del sistema
                    </Text>
                  </VStack>
                </CardBody>
              </Card>
            </ScaleFade>
          ))}
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
                  placeholder="Periodo temporale"
                  value={filtroTemporale}
                  onChange={(e) => setFiltroTemporale(e.target.value as FiltroTemporale)}
                  maxW="250px"
                >
                  <option value="tutti">Tutti i periodi</option>
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
                      maxW="180px"
                    />
                    <Text color="gray.600">al</Text>
                    <Input
                      type="date"
                      value={dataFine}
                      onChange={(e) => setDataFine(e.target.value)}
                      maxW="180px"
                    />
                  </>
                )}

                {/* Indicatore periodo selezionato */}
                {(filtroTemporale !== "tutti" && filtroTemporale !== "personalizzato") && (
                  <Badge colorScheme="blue" variant="subtle">
                    {dataInizio && `Dal ${new Date(dataInizio).toLocaleDateString("it-IT")}`}
                    {dataFine && ` al ${new Date(dataFine).toLocaleDateString("it-IT")}`}
                  </Badge>
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
                  {searchTerm && (
                    <InputRightElement>
                      <IconButton
                        aria-label="Clear search"
                        icon={<FiFilter />}
                        size="sm"
                        variant="ghost"
                        onClick={() => setSearchTerm("")}
                      />
                    </InputRightElement>
                  )}
                </InputGroup>

                {/* Filtri categoria e cliente */}
                <Select
                  placeholder="Tutte le categorie"
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  maxW="250px"
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
                  maxW="250px"
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

        {/* Tabella Segnalazioni */}
        <Card bg={cardBg} shadow="lg" border="1px" borderColor={borderColor}>
          <CardHeader pb={0}>
            <Flex justify="space-between" align="center">
              <Heading size="md" color="gray.700">
                Segnalazioni
                {filtroTemporale !== "tutti" && (
                  <Badge ml={2} colorScheme="blue">
                    {filtroTemporale}
                  </Badge>
                )}
              </Heading>
              <Text color="gray.500" fontSize="sm">
                {segnalazioniFiltrate.length} risultati
              </Text>
            </Flex>
          </CardHeader>
          <CardBody>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead bg="gray.50">
                  <Tr>
                    <Th>Data</Th>
                    <Th>Ora</Th>
                    <Th>Categoria</Th>
                    <Th>Sala</Th>
                    <Th>Descrizione</Th>
                    <Th>Priorità</Th>
                    <Th>Stato</Th>
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
                      <Td>
                        <Badge colorScheme="blue" variant="subtle">
                          {s.categoria}
                        </Badge>
                      </Td>
                      <Td fontWeight="medium">{s.sala}</Td>
                      <Td maxW="300px">
                        <Tooltip label={s.descrizione}>
                          <Text noOfLines={2} fontSize="sm">
                            {s.descrizione}
                          </Text>
                        </Tooltip>
                      </Td>
                      <Td>
                        <Badge colorScheme={getPriorityColor(s.priorita)}>
                          {s.priorita || "N/A"}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Icon as={getStatusIcon(s.stato)} color={`${getStatusColor(s.stato)}.500`} />
                          <Badge colorScheme={getStatusColor(s.stato)}>
                            {s.stato || "N/A"}
                          </Badge>
                        </HStack>
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
