import React, { useState } from "react";
import {
  Box,
  Button,
  Input,
  Heading,
  VStack,
  useToast,
  Image,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  Text,
  Divider,
  Link,
  Flex,
  keyframes,
  ScaleFade,
  Alert,
  AlertIcon,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { EmailIcon, LockIcon, ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { FiShield, FiUserCheck } from "react-icons/fi";
import logo from "/servizinet_logo.png";

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
  50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.5); }
  100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
`;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "Campi obbligatori",
        description: "Inserisci email e password",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(email, password);
      
      toast({
        title: "Accesso effettuato!",
        description: `Benvenuto ${user.nome || ''}`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });

      // Piccolo delay per mostrare il toast
      setTimeout(() => {
        if (user.ruolo === "admin") {
          navigate("/dashboard");
        } else if (user.ruolo === "operatore") {
          navigate("/segnalazioni");
        } else {
          toast({ 
            title: "Ruolo non autorizzato", 
            status: "error",
            duration: 3000,
          });
        }
      }, 1000);

    } catch (error) {
      toast({
        title: "Accesso fallito",
        description: "Verifica le tue credenziali",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgGradient="linear(135deg, #667eea 0%, #764ba2 100%)"
      position="relative"
      overflow="hidden"
    >
      {/* Background decorative elements */}
      <Box
        position="absolute"
        top="-10%"
        right="-10%"
        w="400px"
        h="400px"
        borderRadius="full"
        bg="whiteAlpha.100"
        animation={`${floatAnimation} 6s ease-in-out infinite`}
      />
      <Box
        position="absolute"
        bottom="-10%"
        left="-10%"
        w="300px"
        h="300px"
        borderRadius="full"
        bg="whiteAlpha.100"
        animation={`${floatAnimation} 8s ease-in-out infinite`}
      />

      <ScaleFade in={true} initialScale={0.9}>
        <Box
          bg="white"
          p={8}
          borderRadius="3xl"
          shadow="2xl"
          w={{ base: "90vw", sm: "400px", md: "450px" }}
          maxW="450px"
          borderWidth={1}
          borderColor="whiteAlpha.400"
          backdropFilter="blur(10px)"
          bgGradient="linear(to-br, white, gray.50)"
          position="relative"
          zIndex={1}
          animation={`${glowAnimation} 3s ease-in-out infinite`}
        >
          <VStack spacing={6}>
            {/* Logo Section */}
            <Box textAlign="center">
              <Box
                animation={`${floatAnimation} 3s ease-in-out infinite`}
                display="inline-block"
              >
                <Image 
                  src={logo} 
                  alt="ServiziNet Logo" 
                  boxSize="100px" 
                  mb={2}
                  filter="drop-shadow(0 4px 8px rgba(0,0,0,0.1))"
                />
              </Box>
              <Heading 
                size="lg" 
                bgGradient="linear(to-r, blue.600, purple.600)"
                bgClip="text"
                fontWeight="bold"
                mb={2}
              >
                Portale ServiziNet
              </Heading>
              <Text color="gray.600" fontSize="sm" fontWeight="medium">
                Accedi al sistema di gestione
              </Text>
            </Box>

            <Divider borderColor="gray.200" />

            {/* Login Form */}
            <VStack spacing={5} w="100%">
              <FormControl>
                <FormLabel 
                  fontSize="sm" 
                  fontWeight="semibold" 
                  color="gray.700"
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <Icon as={FiUserCheck} color="blue.500" />
                  Email
                </FormLabel>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none">
                    <EmailIcon color="blue.400" />
                  </InputLeftElement>
                  <Input
                    type="email"
                    placeholder="la.tua@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    focusBorderColor="blue.400"
                    bg="white"
                    borderColor="gray.300"
                    _hover={{ borderColor: "blue.300" }}
                    _focus={{ bg: "blue.50" }}
                    onKeyPress={handleKeyPress}
                  />
                </InputGroup>
              </FormControl>

              <FormControl>
                <FormLabel 
                  fontSize="sm" 
                  fontWeight="semibold" 
                  color="gray.700"
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <Icon as={FiShield} color="blue.500" />
                  Password
                </FormLabel>
                <InputGroup size="lg">
                  <InputLeftElement pointerEvents="none">
                    <LockIcon color="blue.400" />
                  </InputLeftElement>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="La tua password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    focusBorderColor="blue.400"
                    bg="white"
                    borderColor="gray.300"
                    _hover={{ borderColor: "blue.300" }}
                    _focus={{ bg: "blue.50" }}
                    onKeyPress={handleKeyPress}
                  />
                  <InputLeftElement right="0" pointerEvents="auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      _hover={{ bg: "blue.50" }}
                    >
                      {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    </Button>
                  </InputLeftElement>
                </InputGroup>
              </FormControl>

              <Button
                colorScheme="blue"
                onClick={handleLogin}
                w="full"
                size="lg"
                borderRadius="xl"
                shadow="md"
                isLoading={isLoading}
                loadingText="Accesso in corso..."
                bgGradient="linear(to-r, blue.500, purple.500)"
                _hover={{
                  bgGradient: "linear(to-r, blue.600, purple.600)",
                  shadow: "lg",
                  transform: "translateY(-2px)",
                }}
                _active={{
                  transform: "translateY(0px)",
                }}
                transition="all 0.2s"
                fontWeight="bold"
                fontSize="md"
                mt={2}
              >
                Accedi al Portale
              </Button>
            </VStack>

            <Divider borderColor="gray.200" />

            {/* Footer */}
            <VStack spacing={3} textAlign="center">
              <Text color="gray.500" fontSize="xs" fontWeight="medium">
                Sistema di gestione segnalazioni
              </Text>
              <HStack spacing={4} color="gray.400">
                <Text fontSize="xs">Privacy</Text>
                <Text fontSize="xs">•</Text>
                <Text fontSize="xs">Termini</Text>
                <Text fontSize="xs">•</Text>
                <Text fontSize="xs">Supporto</Text>
              </HStack>
              <Text color="gray.400" fontSize="xs" fontWeight="medium">
                © 2025 ServiziNet • v2.1.0
              </Text>
            </VStack>
          </VStack>
        </Box>
      </ScaleFade>

      {/* Security Badge */}
      <Box
        position="absolute"
        bottom={4}
        right={4}
        bg="whiteAlpha.200"
        px={3}
        py={1}
        borderRadius="full"
        backdropFilter="blur(10px)"
      >
        <HStack spacing={1}>
          <FiShield size={12} color="white" />
          <Text fontSize="xs" color="white" fontWeight="medium">
            Secure Login
          </Text>
        </HStack>
      </Box>
    </Box>
  );
}
