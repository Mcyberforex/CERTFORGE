import { DOMAINS } from './domains.js';
import { DOMAIN_TOPICS } from './domainContent.js';

const EXTRA_QUESTIONS = [
  {
    id: 'fe-x1',
    question: 'A switch receives a frame with a destination MAC it has never seen. What does it do?',
    options: [
      'Drops the frame — unknown destination',
      'Sends an ARP request to find the destination',
      'Floods the frame out all ports except the source port',
      'Forwards it to the default gateway',
    ],
    correct: 2,
    explanation: 'Unknown unicast flooding — when a switch has no MAC table entry for a destination, it floods the frame out all ports except the one it arrived on. This is normal Layer 2 behavior.',
  },
  {
    id: 'fe-x2',
    question: 'A host is assigned 169.254.44.10. Which problem does this indicate?',
    options: [
      'Static IP conflict with another host',
      'The DHCP server is unreachable — APIPA assigned the address',
      'NAT is misconfigured on the router',
      'DNS failed to resolve the hostname',
    ],
    correct: 1,
    explanation: 'APIPA (169.254.0.0/16) is automatically assigned when a host fails to reach a DHCP server. It enables local communication only — the device has no internet access.',
  },
  {
    id: 'fe-x3',
    question: 'Which statement correctly describes a collision domain vs. a broadcast domain?',
    options: [
      'Switches break broadcast domains; routers break collision domains',
      'Routers break both collision and broadcast domains',
      'Switches break collision domains; only routers (or VLANs) break broadcast domains',
      'Hubs break both collision and broadcast domains',
    ],
    correct: 2,
    explanation: 'Each switch port is its own collision domain. Broadcast domains span all ports on a switch and are only broken by routers or VLANs.',
  },
  {
    id: 'fe-x4',
    question: 'A host at 10.5.5.100/22 is trying to reach 10.5.7.200. Are they on the same subnet?',
    options: [
      'No — /22 means they are in different /24 networks',
      'Yes — /22 block covers .4.0–.7.255; both hosts fall in the 10.5.4.0/22 network',
      'No — 10.5.7.200 is outside the /22 block',
      'Yes — all 10.x.x.x addresses are on the same Class A network',
    ],
    correct: 1,
    explanation: '/22 subnet mask = 255.255.252.0, block size = 4 in 3rd octet. 10.5.5.100 → network 10.5.4.0. 10.5.7.200 → also 10.5.4.0 (covers .4.0–.7.255). Same subnet.',
  },
  {
    id: 'fe-x5',
    question: 'ping succeeds from Host A to Host B, but Host A cannot browse Host B\'s web server. At which OSI layer is the likely fault?',
    options: [
      'Layer 1 — Physical (cabling issue)',
      'Layer 3 — Network (routing problem)',
      'Layer 7 — Application (web service is down or blocked)',
      'Layer 2 — Data Link (MAC table issue)',
    ],
    correct: 2,
    explanation: 'A successful ping proves Layers 1–3 work. The inability to reach the web service points to Layer 7 (Application) — the web server may be stopped, misconfigured, or blocked by a firewall rule.',
  },
  {
    id: 'fe-x6',
    question: 'Which TWO IPv4 addresses are private per RFC 1918?',
    options: [
      '172.32.0.1 and 192.168.5.1',
      '10.10.10.10 and 172.20.5.5',
      '192.0.2.1 and 10.0.0.1',
      '172.32.0.1 and 10.255.255.255',
    ],
    correct: 1,
    explanation: 'Private ranges: 10.0.0.0/8, 172.16.0.0–172.31.255.255, 192.168.0.0/16. 10.10.10.10 ✓ and 172.20.5.5 ✓ are both private. 172.32.x.x is PUBLIC (outside /12). 192.0.2.0/24 is documentation range.',
  },
  {
    id: 'fe-x7',
    question: 'How many bits are borrowed from a /24 to create /28 subnets, and how many /28 subnets result?',
    options: [
      '2 bits borrowed — 4 subnets',
      '3 bits borrowed — 8 subnets',
      '4 bits borrowed — 16 subnets',
      '6 bits borrowed — 64 subnets',
    ],
    correct: 2,
    explanation: '/28 − /24 = 4 bits borrowed. 2⁴ = 16 subnets, each with 14 usable hosts.',
  },
  {
    id: 'fe-x8',
    question: 'TCP window size is set to 0 by the receiver. What must the sender do?',
    options: [
      'Reset the connection with an RST flag',
      'Retransmit the last unacknowledged segment',
      'Stop sending data until the window opens again',
      'Switch to UDP for the remainder of the session',
    ],
    correct: 2,
    explanation: 'A TCP receive window of 0 tells the sender to halt transmission. The receiver will send a window update when its buffer has space. This is TCP flow control in action.',
  },
  {
    id: 'fe-x9',
    question: 'Which firewall type inspects actual HTTP/HTTPS content and can block based on URLs or application behavior?',
    options: [
      'Packet-filtering firewall (Layer 3)',
      'Stateful inspection firewall (Layer 4)',
      'Application-layer / proxy firewall (Layer 7)',
      'Circuit-level gateway (Layer 5)',
    ],
    correct: 2,
    explanation: 'Application-layer firewalls (Layer 7) inspect payload content, enabling URL filtering, application identification, and deep packet inspection. Basic firewalls only look at IP/port headers.',
  },
  {
    id: 'fe-x10',
    question: 'Which protocol does traceroute rely on to map network hops?',
    options: [
      'ARP — to find MAC addresses at each hop',
      'ICMP Time Exceeded messages from each router as TTL expires',
      'TCP SYN/ACK to each intermediate router',
      'SNMP GET requests to each router\'s management interface',
    ],
    correct: 1,
    explanation: 'Traceroute sends probes with incrementally increasing TTL. Each router that discards an expired packet sends back ICMP Time Exceeded, revealing the hop. The final destination sends ICMP Port Unreachable.',
  },
  {
    id: 'fe-x11',
    question: 'What is the subnet mask for a /20 network in dotted-decimal notation?',
    options: ['255.255.0.0', '255.255.240.0', '255.255.248.0', '255.255.255.0'],
    correct: 1,
    explanation: '/20 = 20 bits network. First 16 bits = 255.255. Next 4 bits of 3rd octet = 11110000 = 240. Mask = 255.255.240.0. Block size = 256−240 = 16 in 3rd octet.',
  },
  {
    id: 'fe-x12',
    question: 'A company needs exactly 500 usable host addresses per subnet. What is the minimum prefix that satisfies this?',
    options: ['/22 — 1022 hosts', '/23 — 510 hosts', '/24 — 254 hosts', '/21 — 2046 hosts'],
    correct: 1,
    explanation: '/24 only gives 254 — not enough. /23 gives 2⁹ − 2 = 510 usable hosts, which satisfies the requirement. /22 works but wastes addresses unnecessarily.',
  },
  {
    id: 'fe-x13',
    question: 'An email client sends outbound mail to its provider on port 587 using authentication. An MX record points inbound mail to port 25. Why the different ports?',
    options: [
      'Port 587 is for encrypted; port 25 is for unencrypted — always use 587',
      'Port 587 is client-to-server SMTP submission (authenticated); port 25 is server-to-server relay (unauthenticated)',
      'Port 25 is for receiving; port 587 is for receiving with TLS',
      'They are interchangeable — either can be used for any SMTP traffic',
    ],
    correct: 1,
    explanation: 'Port 25 is SMTP relay — used between mail servers, typically without client authentication. Port 587 (submission) is for end-users sending mail to their provider, requiring authentication to prevent abuse.',
  },
  {
    id: 'fe-x14',
    question: 'Which combination correctly pairs a protocol with its transport (TCP or UDP) and port?',
    options: [
      'DNS — TCP 53 for all queries',
      'DHCP — TCP 67/68',
      'NTP — UDP 123',
      'SNMP traps — TCP 162',
    ],
    correct: 2,
    explanation: 'NTP uses UDP port 123. DNS uses UDP 53 (small queries) and TCP 53 (large responses/zone transfers). DHCP uses UDP 67/68. SNMP traps use UDP 162.',
  },
  {
    id: 'fe-x15',
    question: 'What does the TTL (Time to Live) field prevent in an IP network?',
    options: [
      'Fragmentation of large packets across slow WAN links',
      'Packets from circulating indefinitely due to routing loops',
      'Duplicate delivery of TCP segments',
      'Out-of-order arrival of UDP datagrams',
    ],
    correct: 1,
    explanation: 'TTL is decremented by 1 at each router. When it reaches 0, the packet is dropped and an ICMP Time Exceeded is returned. This prevents routing loops from keeping packets alive forever.',
  },
  {
    id: 'fe-x16',
    question: 'A router receives a packet destined for 192.168.5.0/24 but has no matching route. What happens?',
    options: [
      'The router broadcasts the packet to find the destination',
      'The packet is forwarded to the default gateway',
      'The packet is dropped and an ICMP Destination Unreachable is sent to the source',
      'The router sends an ARP request for the destination IP',
    ],
    correct: 2,
    explanation: 'When a router has no matching route and no default route, it drops the packet and sends ICMP Destination Unreachable back to the source. ARP is not used for remote destinations.',
  },
  {
    id: 'fe-x17',
    question: 'Which is the MOST secure remote access solution for managing a Linux server?',
    options: [
      'Telnet on port 23 — fast, direct terminal access',
      'RDP on port 3389 — graphical desktop',
      'SSH on port 22 — encrypted command-line access',
      'HTTP management console on port 80',
    ],
    correct: 2,
    explanation: 'SSH (port 22) provides encrypted remote terminal access and is the standard for Linux server management. Telnet (23) and HTTP (80) are plaintext and should never be used for server management.',
  },
  {
    id: 'fe-x18',
    question: 'BGP is the routing protocol that runs the internet. What makes it different from OSPF?',
    options: [
      'BGP is an interior gateway protocol; OSPF is exterior',
      'BGP uses Dijkstra\'s algorithm; OSPF uses Bellman-Ford',
      'BGP is an exterior gateway protocol running between autonomous systems; OSPF runs within a single AS',
      'BGP runs over UDP; OSPF runs over TCP',
    ],
    correct: 2,
    explanation: 'BGP (Border Gateway Protocol) is an EGP — it connects different autonomous systems (ISPs, large orgs). OSPF is an IGP — it operates inside a single organization\'s network. BGP runs over TCP 179.',
  },
  {
    id: 'fe-x19',
    question: 'An administrator sees MAC address table entries on a switch changing very rapidly from many ports. What attack is likely occurring?',
    options: [
      'ARP spoofing targeting the default gateway',
      'MAC flooding attack trying to overflow the CAM table',
      'SYN flood attack against a server',
      'DNS poisoning attack against the local resolver',
    ],
    correct: 1,
    explanation: 'MAC flooding sends thousands of frames with fake source MACs, overflowing the CAM table. The switch enters "fail-open" mode and floods all frames like a hub — enabling the attacker to capture traffic.',
  },
  {
    id: 'fe-x20',
    question: 'A host\'s NIC is at Layer 2, and its IP stack is at Layer 3. When the host sends data to a remote server, which address changes at every hop and which stays constant end-to-end?',
    options: [
      'MAC address stays constant; IP address changes at each hop',
      'Both MAC and IP change at each hop',
      'IP address stays constant; MAC address changes at each hop',
      'Neither changes — both are static for the entire path',
    ],
    correct: 2,
    explanation: 'Source/destination IP addresses stay constant end-to-end (Layer 3). Source/destination MAC addresses change at every router hop — each router rewrites them with its own MAC and the next-hop MAC (Layer 2).',
  },
];

export const FINAL_EXAM_DOMAIN_WEIGHTS = {
  1: 0.23,
  2: 0.20,
  3: 0.19,
  4: 0.14,
  5: 0.24,
};

function shuffleArr(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function shuffleQuestionAnswers(question) {
  const correctAnswer = question.options[question.correct];
  const options = shuffleArr(question.options);
  return {
    ...question,
    options,
    correct: options.findIndex(opt => opt === correctAnswer),
  };
}

function getDomainQuestions(domainId) {
  const domain = DOMAINS.find(d => d.id === Number(domainId));
  return Object.values(DOMAIN_TOPICS[domainId] || {}).flatMap(topic =>
    topic.quiz.map(q => ({
      ...q,
      id: `d${domainId}-${q.id}`,
      domainId: Number(domainId),
      domainName: domain?.name || `Domain ${domainId}`,
      type: 'mc',
      weight: 1,
    }))
  );
}

export function getFinalExamQuestions(count = 90) {
  const selected = [];
  let remaining = count;
  const domainIds = Object.keys(FINAL_EXAM_DOMAIN_WEIGHTS);

  domainIds.forEach((domainId, idx) => {
    const target = idx === domainIds.length - 1
      ? remaining
      : Math.round(count * FINAL_EXAM_DOMAIN_WEIGHTS[domainId]);
    remaining -= target;
    selected.push(...shuffleArr(getDomainQuestions(domainId)).slice(0, target));
  });

  return shuffleArr(selected)
    .slice(0, count)
    .map((question, index) => shuffleQuestionAnswers({
      ...question,
      type: index < 5 ? 'pbq' : question.type,
      weight: index < 5 ? 3 : question.weight,
    }));
}

export const FINAL_EXAM_MINUTES = 90;
export const FINAL_EXAM_PASS    = 720;
export const FINAL_EXAM_COUNT   = 90;
export const FINAL_EXAM_MIN_SCORE = 100;
export const FINAL_EXAM_MAX_SCORE = 900;
