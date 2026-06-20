// "use client";

// import {
//   Box,
//   Flex,
//   Avatar,
//   Text,
//   Badge,
//   Button,
//   Skeleton,
//   Stack,
//   Grid,
// } from "@chakra-ui/react";
// import { useToast } from "@chakra-ui/toast";

// import {  Calendar, Clock, Building, User, Mail, Briefcase, Space } from "lucide-react";
// import { useEffect, useState, memo } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { dashboardApi } from "@/services/api";
// // === Types ===
// interface Employee {
//   _id: string;
//   name: string;
//   email: string;
//   phone?: string;
//   role: string;
//   department: string;
//   status: "Permanent" | "Contract";
//   avatar?: string;
//   joinedAt: string;
//   companyId: string;
//   companyName: string;
//   linkedEmployees?: string[];
// }

// interface Shift {
//   id: string;
//   title: string;
//   date: string;
//   time: string;
//   status: "Scheduled" | "Visited" | "Waiting";
// }

// // === Constants ===
// const TEXT_PRIMARY = "#162837";
// const TEXT_SECONDARY = "#4A5568";
// const BORDER_COLOR = "#E2E8F0";
// const BG_CARD = "white";

// // === Skeleton for Loading ===
// const DetailsSkeleton = memo(() => (
//   <Box p={8} bg={BG_CARD} borderRadius="xl" boxShadow="md">
//     <Flex gap={6} mb={8}>
//       <Skeleton height="120px" width="120px" borderRadius="full" />
//       <Box flex="1">
//         <Skeleton height="32px" width="200px" mb={2} />
//         <Skeleton height="20px" width="150px" />
//       </Box>
//     </Flex>
//     <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} mb={8}>
//       {[...Array(6)].map((_, i) => (
//         <Skeleton key={i} height="80px" borderRadius="lg" />
//       ))}
//     </Grid>
//     <Skeleton height="200px" borderRadius="lg" />
//   </Box>
// ));
// DetailsSkeleton.displayName = "DetailsSkeleton";

// // === Main Component ===
// const EmployeeDetails = () => {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const toast = useToast();

//   const [employee, setEmployee] = useState<Employee | null>(null);
//   const [shifts, setShifts] = useState<Shift[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   // === Load Employee + Shifts ===
//   useEffect(() => {
//     const loadData = async () => {
//       if (!id) return;

//       setIsLoading(true);
//       setError(null);

//       try {
//         // 1. Get Employee
//         const empRes = await dashboardApi.getUserById(id);
//         const empData = empRes.data.user;

//         // 2. Get Company Name (if companyId exists)
//         let companyName = "Unknown Company";
//         if (empData.companyId) {
//           try {
//             const compRes = await dashboardApi.getCompany(empData.companyId);
//             companyName = compRes.data.name || companyName;
//           } catch (err) {
//             console.warn("Could not load company name");
//           }
//         }

//         const employee: Employee = {
//           _id: empData._id,
//           name: empData.name,
//           email: empData.email,
//           phone: empData.phone || "Not provided",
//           role: empData.role,
//           department: empData.department || "General",
//           status: empData.status || "Permanent",
//           avatar: empData.avatar || `https://i.pravatar.cc/300?u=${empData._id}`,
//           joinedAt: empData.createdAt
//             ? new Date(empData.createdAt).toLocaleDateString("en-US", {
//                 month: "long",
//                 year: "numeric",
//               })
//             : "Unknown",
//           companyId: empData.companyId,
//           companyName,
//           linkedEmployees: empData.linkedEmployees || [],
//         };

//         // 3. Get Shifts
//         const shiftRes = await dashboardApi.getShifts();
//         const allShifts = shiftRes.data.shifts || [];

//         const employeeShifts: Shift[] = allShifts
//           .filter((s: any) => {
//             const assignedName = s.assignedTo?.name?.trim();
//             const userName = s.user?.name?.trim();
//             return assignedName === employee.name || userName === employee.name;
//           })
//           .slice(0, 5)
//           .map((s: any) => ({
//             id: s._id,
//             title: s.title,
//             date: new Date(s.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
//             time: `${s.startTime} - ${s.endTime}`,
//             status: s.status === "COMPLETED" ? "Visited" : s.status === "MISSED" ? "Waiting" : "Scheduled",
//           }));

//         setEmployee(employee);
//         setShifts(employeeShifts);
//       } catch (err: any) {
//         const msg = err.message || "Failed to load employee details";
//         setError(msg);
//         toast({
//           title: "Error",
//           description: msg,
//           status: "error",
//           duration: 5000,
//           isClosable: true,
//         });
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadData();
//   }, [id, toast]);

//   // === Helper: Status Badge ===
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "Visited": return { bg: "green.50", color: "green.700" };
//       case "Scheduled": return { bg: "blue.50", color: "blue.700" };
//       case "Waiting": return { bg: "orange.50", color: "orange.700" };
//       default: return { bg: "gray.50", color: "gray.700" };
//     }
//   };

//   // === Loading / Error States ===
//   if (isLoading) {
//     return (
//       <Box minH="100vh" bg="#F7F9FC" p={8}>
//         <Box maxW="1200px" mx="auto">
//           <DetailsSkeleton />
//         </Box>
//       </Box>
//     );
//   }

//   if (error || !employee) {
//     return (
//       <Box minH="100vh" bg="#F7F9FC" p={8} textAlign="center">
//         <Box maxW="600px" mx="auto" bg="white" p={8} borderRadius="xl" boxShadow="md">
//           <Text color="red.600" fontWeight="bold" mb={4}>
//             Error
//           </Text>
//           <Text color={TEXT_SECONDARY} mb={6}>
//             {error || "Employee not found"}
//           </Text>
//           <Button
//             // leftIcon={<ArrowLeft size={18} />}
//             onClick={() => navigate(-1)}
//             colorScheme="blue"
//             bg={TEXT_PRIMARY}
//           >
//             Go Back
//           </Button>
//         </Box>
//       </Box>
//     );
//   }

//   return (
//     <Box minH="100vh" bg="#F7F9FC" p={{ base: 4, md: 6, lg: 8 }}>
//       <Box maxW="1200px" mx="auto">
//         {/* Back Button */}
//         <Button
//         //   leftIcon={<ArrowLeft size={18} />}
//           variant="ghost"
//           onClick={() => navigate(-1)}
//           mb={6}
//           color={TEXT_PRIMARY}
//           _hover={{ bg: "gray.50" }}
//         >
//           Back to Employees
//         </Button>

//         {/* Main Card */}
//         <Box bg={BG_CARD} borderRadius="xl" boxShadow="md" overflow="hidden" border="1px solid" borderColor={BORDER_COLOR}>
//           {/* Header: Avatar + Name + Role */}
//           <Flex p={8} gap={6} align="center" flexWrap={{ base: "wrap", md: "nowrap" }}>
//             <Avatar.Root size="2xl">
//               <Avatar.Image src={employee.avatar} alt={employee.name} />
//               <Avatar.Fallback bg={TEXT_PRIMARY} color="white">
//                 {employee.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
//               </Avatar.Fallback>
//             </Avatar.Root>

//             <Box flex="1">
//               <Text fontSize="2xl" fontWeight="bold" color={TEXT_PRIMARY}>
//                 {employee.name}
//               </Text>
//               <Text fontSize="lg" color={TEXT_SECONDARY} mt={1}>
//                 {employee.role} • {employee.department}
//               </Text>
//               <Flex gap={3} mt={3} flexWrap="wrap">
//                 <Badge colorScheme={employee.status === "Permanent" ? "green" : "orange"} fontSize="sm">
//                   {employee.status}
//                 </Badge>
//                 <Button
//                   size="sm"
//                   variant="outline"
//                 //   rightIcon={<ExternalLink size={14} />}
//                   onClick={() => navigate(`/profile/${employee._id}`)}
//                   color={TEXT_PRIMARY}
//                   borderColor={BORDER_COLOR}
//                 >
//                   View Profile
//                 </Button>
//               </Flex>
//             </Box>
//           </Flex>

//           <Space />

//           {/* Details Grid */}
//           <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} p={8}>
//             <InfoItem icon={Mail} label="Email" value={employee.email} />
          
//             <InfoItem icon={Calendar} label="Joined" value={employee.joinedAt} />
//             <InfoItem icon={Briefcase} label="Role" value={employee.role} />
//             <InfoItem icon={Building} label="Company" value={employee.companyName} />
//             <InfoItem icon={User} label="Linked Employees" value={`${employee.linkedEmployees?.length || 0} employees`} />
//           </Grid>

//           <Space  />

//           {/* Recent Shifts */}
//           <Box p={8}>
//             <Text fontSize="lg" fontWeight="bold" color={TEXT_PRIMARY} mb={4}>
//               Recent Shifts
//             </Text>

//             {shifts.length === 0 ? (
//               <Text color={TEXT_SECONDARY} fontStyle="italic">
//                 No shifts assigned yet.
//               </Text>
//             ) : (
//               <Stack gap={3}>
//                 {shifts.map((shift) => (
//                   <Flex
//                     key={shift.id}
//                     p={4}
//                     bg="gray.50"
//                     borderRadius="lg"
//                     align="center"
//                     justify="space-between"
//                     flexWrap="wrap"
//                     gap={3}
//                   >
//                     <Box>
//                       <Text fontWeight="600" color={TEXT_PRIMARY}>
//                         {shift.title}
//                       </Text>
//                       <Flex gap={4} mt={1} fontSize="sm" color={TEXT_SECONDARY}>
//                         <Flex align="center" gap={1}>
//                           <Calendar size={14} />
//                           {shift.date}
//                         </Flex>
//                         <Flex align="center" gap={1}>
//                           <Clock size={14} />
//                           {shift.time}
//                         </Flex>
//                       </Flex>
//                     </Box>
//                     <Badge {...getStatusColor(shift.status)} px={3} py={1} borderRadius="md">
//                       {shift.status}
//                     </Badge>
//                   </Flex>
//                 ))}
//               </Stack>
//             )}
//           </Box>
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// // === Reusable Info Item ===
// const InfoItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
//   <Flex align="center" gap={3} p={4} bg="gray.50" borderRadius="lg">
//     <Flex
//       align="center"
//       justify="center"
//       w="40px"
//       h="40px"
//       bg="blue.50"
//       borderRadius="lg"
//       color="blue.600"
//       flexShrink={0}
//     >
//       <Icon size={18} />
//     </Flex>
//     <Box>
//       <Text fontSize="xs" color={TEXT_SECONDARY} fontWeight="medium">
//         {label}
//       </Text>
//       <Text fontSize="sm" color={TEXT_PRIMARY} fontWeight="600">
//         {value}
//       </Text>
//     </Box>
//   </Flex>
// );

// export default EmployeeDetails;


