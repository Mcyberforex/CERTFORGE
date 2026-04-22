import { DOMAIN1_TOPICS, TOPIC_ORDER as DOMAIN1_TOPIC_ORDER } from './domain1.js';

export const MIN_QUIZ_QUESTIONS = 22;

const makeLesson = (id, title, intro, tableRows, tip, prompt) => ({
  id,
  title,
  xp: 50,
  sections: [
    { type: 'text', content: intro },
    { type: 'table', headers: ['Concept', 'Purpose', 'Exam Focus'], rows: tableRows },
    { type: 'callout', label: 'EXAM TIP', content: tip },
    { type: 'prompt', ...prompt },
  ],
});

const makeTopic = ({ id, name, icon, color, lessons, quiz, pbq }) => ({
  id,
  name,
  icon,
  color,
  lessons,
  quiz,
  pbqs: [pbq],
});

const makeMatchPBQ = (id, title, instructions, leftItems, rightItems, correctMatches) => ({
  id,
  type: 'match',
  title,
  instructions,
  leftItems,
  rightItems,
  correctMatches,
  xp: 100,
});

const makeDeepLesson = (id, title, explanation, keyPoints, example, prompt) => ({
  id,
  title,
  xp: 50,
  sections: [
    { type: 'text', content: explanation },
    { type: 'callout', label: 'KEY POINTS', content: keyPoints.map(point => `• ${point}`).join('\n') },
    { type: 'text', content: `Real-world example: ${example}` },
    { type: 'prompt', ...prompt },
  ],
});

const VLAN_LESSONS = [
  makeDeepLesson(
    'vlans-1',
    'What Is a VLAN?',
    'A VLAN, or Virtual Local Area Network, is a logical network segment created on switches. Instead of every device on a switch belonging to one large network, VLANs let you split devices into separate Layer 2 broadcast domains without needing separate physical switches.',
    ['VLANs are logical, not physical, network boundaries.', 'Devices in the same VLAN behave as if they are on the same LAN.', 'Devices in different VLANs need Layer 3 routing to communicate.', 'VLANs are commonly used to separate users, servers, guests, voice, and management traffic.'],
    'A business can connect employees, printers, phones, and guest Wi-Fi to the same switch stack while keeping each group in a separate VLAN.',
    { question: 'What does a VLAN primarily create?', options: ['A logical Layer 2 network segment', 'A new physical cable type', 'A public IP address range', 'A wireless encryption method'], correct: 0, explanation: 'A VLAN creates a logical Layer 2 segment, also called a broadcast domain.' }
  ),
  makeDeepLesson(
    'vlans-2',
    'Why VLANs Exist',
    'VLANs exist because flat networks become hard to secure, troubleshoot, and scale. Without VLANs, broadcasts from every device can spread everywhere, and all connected hosts may be able to reach each other unless another control blocks them.',
    ['VLANs reduce unnecessary broadcast traffic.', 'They improve security by separating traffic types.', 'They simplify moves, adds, and changes because segmentation is configured logically.', 'They support cleaner troubleshooting by narrowing the affected scope.'],
    'If guest users are placed in a guest VLAN, they can be given internet access without direct access to internal file servers.',
    { question: 'Why are VLANs commonly used in enterprise networks?', options: ['To remove the need for IP addresses', 'To segment traffic and reduce broadcast scope', 'To replace all routing protocols', 'To make every port a trunk'], correct: 1, explanation: 'VLANs segment traffic and reduce the size of broadcast domains.' }
  ),
  makeDeepLesson(
    'vlans-3',
    'Broadcast Domains',
    'A broadcast domain is the set of devices that receive a Layer 2 broadcast frame. VLANs define broadcast domains on switches. A broadcast sent by a device in VLAN 10 stays in VLAN 10 and is not forwarded into VLAN 20 by normal Layer 2 switching.',
    ['Each VLAN is a separate broadcast domain.', 'Broadcast frames do not cross VLAN boundaries without Layer 3 help.', 'Smaller broadcast domains reduce unnecessary host processing.', 'Broadcast domain design affects performance and troubleshooting scope.'],
    'An ARP request from an accounting workstation in VLAN 20 should not be seen by a guest laptop in VLAN 50.',
    { question: 'A broadcast sent in VLAN 30 is normally received by which devices?', options: ['Only devices in VLAN 30', 'All devices on every VLAN', 'Only routers on the internet', 'Only wireless devices'], correct: 0, explanation: 'Layer 2 broadcasts are contained within the VLAN where they originate.' }
  ),
  makeDeepLesson(
    'vlans-4',
    'VLAN IDs and Naming',
    'VLANs are identified by numeric VLAN IDs. Standard VLAN IDs range from 1 to 4094, though many environments reserve certain IDs for management or infrastructure use. Clear names help administrators understand the purpose of each VLAN.',
    ['VLAN IDs identify logical segments on switches.', 'VLAN 1 exists by default on many switches but should not be used casually for everything.', 'Meaningful names reduce configuration mistakes.', 'Documentation should map VLAN IDs to subnets, gateways, and business purpose.'],
    'A network team might document VLAN 10 as Staff, VLAN 20 as Voice, VLAN 30 as Servers, and VLAN 50 as Guest Wi-Fi.',
    { question: 'Why should VLANs be clearly named and documented?', options: ['To avoid IP routing entirely', 'To reduce configuration mistakes and improve support', 'To disable switching loops', 'To encrypt trunk links'], correct: 1, explanation: 'Clear naming and documentation help administrators understand and support VLAN design.' }
  ),
  makeDeepLesson(
    'vlans-5',
    'Access Ports',
    'An access port belongs to one VLAN and is normally used for endpoint devices like PCs, printers, cameras, or phones. Frames entering and leaving an access port are usually untagged from the endpoint perspective.',
    ['Access ports carry traffic for one VLAN.', 'They are used for end-user or endpoint device connections.', 'The switch internally associates untagged frames with the configured access VLAN.', 'Incorrect access VLAN assignment is a common cause of connectivity problems.'],
    'If a printer is plugged into a port assigned to the guest VLAN instead of the staff VLAN, employees may not be able to reach it.',
    { question: 'What type of switch port is normally used for a user workstation?', options: ['Access port', 'Trunk port', 'SPAN destination only', 'Console port'], correct: 0, explanation: 'User workstations normally connect to access ports assigned to a single VLAN.' }
  ),
  makeDeepLesson(
    'vlans-6',
    'Trunk Ports',
    'A trunk port carries traffic for multiple VLANs over one physical link. Trunks are commonly used between switches, between a switch and router, or between a switch and virtualization host that needs multiple VLANs.',
    ['Trunks carry multiple VLANs.', 'Trunk links normally use VLAN tags to identify which VLAN each frame belongs to.', 'Allowed VLAN lists control which VLANs may cross a trunk.', 'A trunk misconfiguration can break many VLANs at once.'],
    'Two access switches connected by a trunk can carry staff, voice, server, and management VLAN traffic between wiring closets.',
    { question: 'What is the main purpose of a trunk port?', options: ['Carry one endpoint VLAN only', 'Carry multiple VLANs across one link', 'Assign DHCP addresses', 'Block all broadcasts'], correct: 1, explanation: 'A trunk port carries traffic from multiple VLANs using VLAN tagging.' }
  ),
  makeDeepLesson(
    'vlans-7',
    '802.1Q Tagging',
    'IEEE 802.1Q is the common standard for VLAN tagging on Ethernet trunk links. It inserts VLAN information into Ethernet frames so receiving switches know which VLAN the frame belongs to.',
    ['802.1Q is the standard VLAN trunk tagging method.', 'Tags identify the VLAN for frames crossing trunk links.', 'Access devices usually do not see tags.', 'Tagging allows many VLANs to share one physical link.'],
    'When VLAN 10 and VLAN 20 traffic crosses a switch-to-switch trunk, 802.1Q tags let the receiving switch keep the traffic separated.',
    { question: 'What does 802.1Q provide?', options: ['VLAN tagging on trunk links', 'Wireless authentication only', 'DNS name resolution', 'Copper cable testing'], correct: 0, explanation: '802.1Q is the standard for VLAN tagging on Ethernet trunk links.' }
  ),
  makeDeepLesson(
    'vlans-8',
    'Native VLAN',
    'The native VLAN is the VLAN associated with untagged traffic on an 802.1Q trunk. Native VLAN mismatches can cause traffic leaks or connectivity problems and should be avoided.',
    ['Native VLAN traffic is untagged on many trunk implementations.', 'Both sides of a trunk should agree on the native VLAN.', 'Using an unused VLAN as native is a common security practice.', 'Native VLAN mismatches are common troubleshooting findings.'],
    'If one switch uses VLAN 99 as native and the other uses VLAN 1, untagged traffic can land in the wrong VLAN.',
    { question: 'What problem can a native VLAN mismatch cause?', options: ['Incorrect VLAN placement for untagged traffic', 'Faster routing convergence', 'More DHCP addresses', 'Automatic encryption'], correct: 0, explanation: 'A native VLAN mismatch can place untagged traffic into the wrong VLAN.' }
  ),
  makeDeepLesson(
    'vlans-9',
    'Voice VLANs',
    'Voice VLANs separate IP phone traffic from regular data traffic. This helps apply quality of service, simplify security policy, and keep voice devices in the correct subnet.',
    ['Voice VLANs are commonly used for IP phones.', 'Phones and PCs may share one physical switch port.', 'QoS can prioritize voice traffic to reduce delay and jitter.', 'Voice VLAN design should include DHCP options and call-control reachability.'],
    'An IP phone can tag voice traffic for VLAN 20 while the attached PC sends untagged data traffic assigned to VLAN 10.',
    { question: 'Why place IP phones in a voice VLAN?', options: ['To prioritize and separate voice traffic', 'To remove the need for DHCP', 'To make calls use DNS only', 'To disable QoS'], correct: 0, explanation: 'Voice VLANs separate phone traffic and support QoS for better call quality.' }
  ),
  makeDeepLesson(
    'vlans-10',
    'Management VLANs',
    'A management VLAN is used for administrative access to network devices. It should be restricted to authorized administrators and protected from regular user or guest traffic.',
    ['Management VLANs carry device administration traffic.', 'Access should be limited with ACLs or firewall policy.', 'Do not expose switch management to guest or user VLANs.', 'Management IPs should be documented and monitored.'],
    'Switch SSH access might be reachable only from an IT admin subnet, not from staff laptops or guest Wi-Fi.',
    { question: 'What is the purpose of a management VLAN?', options: ['Administrative access to network devices', 'Guest browsing only', 'Replacing all routing', 'Carrying only broadcast traffic'], correct: 0, explanation: 'A management VLAN is used for controlled administrative access to network devices.' }
  ),
  makeDeepLesson(
    'vlans-11',
    'Inter-VLAN Routing',
    'Devices in different VLANs are in different Layer 2 broadcast domains and usually different IP subnets. To communicate, they need Layer 3 routing through a router, firewall, or Layer 3 switch.',
    ['VLANs separate Layer 2 traffic.', 'Routing is required between VLANs.', 'Each VLAN commonly has its own subnet and default gateway.', 'Security policy can control which VLANs may communicate.'],
    'A staff workstation in VLAN 10 reaches a server in VLAN 30 through a Layer 3 switch SVI or firewall interface.',
    { question: 'What is required for two different VLANs to communicate?', options: ['Layer 3 routing', 'A longer Ethernet cable', 'The same access port', 'Disabling IP addressing'], correct: 0, explanation: 'Traffic between VLANs must be routed at Layer 3.' }
  ),
  makeDeepLesson(
    'vlans-12',
    'Router-on-a-Stick',
    'Router-on-a-stick uses one physical router interface with multiple logical subinterfaces. Each subinterface is associated with a VLAN tag and acts as the gateway for that VLAN.',
    ['Uses one router physical link as a trunk.', 'Subinterfaces map to VLANs.', 'Each VLAN gets a gateway IP on the router.', 'Bandwidth and redundancy can become limitations.'],
    'A small office switch trunks VLAN 10, 20, and 30 to one router interface, where subinterfaces route between them.',
    { question: 'What does router-on-a-stick use to support multiple VLANs?', options: ['Subinterfaces on a trunk link', 'Only access ports', 'A hub', 'A wireless SSID only'], correct: 0, explanation: 'Router-on-a-stick uses tagged subinterfaces on a trunk link.' }
  ),
  makeDeepLesson(
    'vlans-13',
    'Layer 3 Switch SVIs',
    'A switch virtual interface, or SVI, lets a Layer 3 switch route for a VLAN. SVIs are common in campus networks because routing can happen directly on the switch infrastructure.',
    ['SVIs provide gateway IPs for VLANs.', 'Layer 3 switches can route between VLANs locally.', 'SVIs must be up and associated VLANs must exist.', 'ACLs can be applied to control inter-VLAN traffic.'],
    'A distribution switch hosts VLAN 10, 20, and 30 SVIs so user traffic can route quickly without going to an external router.',
    { question: 'What does an SVI provide on a Layer 3 switch?', options: ['A routed interface for a VLAN', 'A cable test result', 'A Wi-Fi channel', 'A DNS record'], correct: 0, explanation: 'An SVI provides Layer 3 gateway functionality for a VLAN.' }
  ),
  makeDeepLesson(
    'vlans-14',
    'VLANs and IP Subnets',
    'In most designs, each VLAN maps to one IP subnet. This makes addressing, routing, DHCP scopes, and security policies easier to understand and troubleshoot.',
    ['One VLAN commonly equals one subnet.', 'The default gateway belongs in the VLAN subnet.', 'DHCP scopes should match VLAN addressing.', 'Wrong subnet mask or gateway can look like a VLAN problem.'],
    'VLAN 10 might use 10.10.10.0/24 with gateway 10.10.10.1, while VLAN 20 uses 10.10.20.0/24 with gateway 10.10.20.1.',
    { question: 'What is the common relationship between VLANs and IP subnets?', options: ['One VLAN maps to one subnet', 'All VLANs must share one subnet', 'VLANs replace IP addressing', 'Subnets only apply to Wi-Fi'], correct: 0, explanation: 'Most designs map each VLAN to its own IP subnet.' }
  ),
  makeDeepLesson(
    'vlans-15',
    'DHCP with VLANs',
    'DHCP must provide the correct address settings for each VLAN. If the DHCP server is not in the same VLAN, a DHCP relay or helper address forwards requests to the server.',
    ['Each VLAN needs the correct DHCP scope.', 'DHCP relay forwards broadcasts across Layer 3 boundaries.', 'Wrong scopes can assign incorrect gateways or DNS servers.', 'APIPA addresses can indicate DHCP failure.'],
    'A Layer 3 switch uses helper addresses so clients in VLAN 10 and VLAN 20 can both receive leases from a central DHCP server.',
    { question: 'What forwards DHCP requests from a VLAN to a remote DHCP server?', options: ['DHCP relay/helper', '802.1Q tag only', 'Native VLAN', 'STP root bridge'], correct: 0, explanation: 'A DHCP relay or helper forwards client DHCP broadcasts to a DHCP server on another network.' }
  ),
  makeDeepLesson(
    'vlans-16',
    'VLAN Security Risks',
    'VLANs improve segmentation, but poor configuration can create security issues. Risks include unused active ports, permissive trunks, native VLAN misuse, and VLAN hopping attacks.',
    ['Disable unused ports or place them in an unused VLAN.', 'Limit allowed VLANs on trunks.', 'Avoid using VLAN 1 for sensitive traffic.', 'Set trunking behavior intentionally instead of relying on defaults.'],
    'A switch port in a lobby should not be left active in the staff VLAN; it should be disabled or assigned to a restricted unused VLAN.',
    { question: 'Which action improves VLAN security?', options: ['Limit allowed VLANs on trunks', 'Use the same VLAN for guests and servers', 'Leave unused ports active', 'Make every port a trunk'], correct: 0, explanation: 'Restricting allowed VLANs on trunks reduces unnecessary exposure.' }
  ),
  makeDeepLesson(
    'vlans-17',
    'Troubleshooting VLAN Connectivity',
    'VLAN troubleshooting follows a layered approach. Verify physical link, port mode, VLAN assignment, trunk allowed VLANs, gateway status, DHCP, and ACL or firewall policy.',
    ['Check whether the port is access or trunk.', 'Verify the VLAN exists on the switch.', 'Confirm trunks allow the VLAN end to end.', 'Test gateway, DHCP, and DNS after Layer 2 is confirmed.'],
    'If a user moves desks and loses access, the new switch port may be assigned to the wrong VLAN.',
    { question: 'A host is patched to a switch but receives an address from the wrong subnet. What should be checked early?', options: ['Access VLAN assignment', 'Monitor brightness', 'Keyboard layout', 'Certificate expiration only'], correct: 0, explanation: 'Wrong subnet assignment often points to an incorrect access VLAN or DHCP scope.' }
  ),
  makeDeepLesson(
    'vlans-18',
    'VLANs in Wireless Networks',
    'Wireless networks often map SSIDs to VLANs. This lets different wireless users share access points while remaining separated by policy and subnet.',
    ['SSIDs can map to different VLANs.', 'Guest Wi-Fi should be isolated from internal networks.', 'Enterprise Wi-Fi may dynamically assign VLANs using RADIUS.', 'Wireless VLAN design must account for DHCP, routing, and firewall rules.'],
    'A company broadcasts Staff and Guest SSIDs from the same access points, but Staff maps to VLAN 10 and Guest maps to VLAN 50.',
    { question: 'Why map different SSIDs to different VLANs?', options: ['To separate wireless user groups', 'To remove encryption', 'To disable DHCP', 'To make all users share one policy'], correct: 0, explanation: 'SSID-to-VLAN mapping separates wireless traffic into different network segments.' }
  ),
  makeDeepLesson(
    'vlans-19',
    'VLAN Design Documentation',
    'Good VLAN design includes documentation for VLAN IDs, names, subnets, gateways, DHCP scopes, trunk paths, and security rules. Documentation helps prevent outages during changes.',
    ['Document VLAN ID and name.', 'Map each VLAN to subnet, gateway, and DHCP scope.', 'Record trunk links and allowed VLANs.', 'Keep security policies tied to business purpose.'],
    'Before adding a new floor switch, the team checks documentation to know which VLANs should be allowed on the uplink trunk.',
    { question: 'Which item should VLAN documentation include?', options: ['VLAN ID, subnet, gateway, and purpose', 'Only the switch color', 'Only user passwords', 'Only the ISP phone number'], correct: 0, explanation: 'Useful VLAN documentation maps IDs to names, subnets, gateways, purpose, and allowed paths.' }
  ),
  makeDeepLesson(
    'vlans-20',
    'Real-World VLAN Design',
    'A practical VLAN design balances segmentation, manageability, routing, and security. Too few VLANs creates a flat network; too many VLANs creates unnecessary operational complexity.',
    ['Group traffic by function and security need.', 'Use routing and firewall policy for controlled communication.', 'Avoid over-segmentation that becomes hard to support.', 'Validate design with real traffic flows and business requirements.'],
    'A branch office might use Staff, Voice, Printers, Guest, Servers, and Management VLANs, with firewall rules controlling which groups can communicate.',
    { question: 'What is a good VLAN design principle?', options: ['Segment by function and security need', 'Put every single device in its own VLAN always', 'Avoid documentation', 'Use guest VLAN for servers'], correct: 0, explanation: 'Good VLAN design segments traffic based on business function, security needs, and operational supportability.' }
  ),
];

const EXPANSION_THEMES = [
  {
    title: 'Core Concepts',
    focus: 'the core purpose, vocabulary, and exam context',
    example: 'A technician reviewing a support ticket first identifies the affected users, services, and devices before changing any configuration.',
  },
  {
    title: 'Design Decisions',
    focus: 'how design choices affect reliability, security, and performance',
    example: 'A small office separates staff, guest, and management traffic so a guest device cannot reach internal administration tools.',
  },
  {
    title: 'Configuration Checks',
    focus: 'the settings, dependencies, and validation steps used in real deployments',
    example: 'After a change window, the administrator verifies connectivity, checks logs, and confirms users can still reach required services.',
  },
  {
    title: 'Troubleshooting Signals',
    focus: 'symptoms, likely causes, and the tests that confirm or reject a theory',
    example: 'When one subnet fails but others work, the team checks gateway, VLAN, routing, and firewall changes before replacing hardware.',
  },
  {
    title: 'Operational Best Practices',
    focus: 'documentation, monitoring, review, and safe change practices',
    example: 'A network team records the final configuration, rollback steps, and validation results so the next technician can understand the fix.',
  },
  {
    title: 'Exam Vocabulary',
    focus: 'the terms and phrases that usually appear in Network+ scenario answers',
    example: 'A student sees "least disruption" in a question and chooses a validation step before making a broad production change.',
  },
  {
    title: 'Planning Requirements',
    focus: 'how business needs, technical limits, and security goals shape implementation choices',
    example: 'Before deploying a new branch network, the team lists user groups, required services, expected growth, and security boundaries.',
  },
  {
    title: 'Layered Thinking',
    focus: 'how the topic maps to OSI layers, TCP/IP behavior, and dependent services',
    example: 'A technician separates physical link checks from IP routing checks so a Layer 1 issue is not misdiagnosed as an application outage.',
  },
  {
    title: 'Common Misconfigurations',
    focus: 'the mistakes that create outages even when the overall design is correct',
    example: 'A single wrong gateway, VLAN assignment, DNS server, or access rule can make a working design fail for one group of users.',
  },
  {
    title: 'Verification Steps',
    focus: 'how to prove the configuration works after implementation or repair',
    example: 'After restoring service, the technician tests from the affected client, checks monitoring, and confirms the user workflow succeeds.',
  },
  {
    title: 'Security Impact',
    focus: 'how the topic affects confidentiality, integrity, availability, and access control',
    example: 'A support team checks whether a proposed change exposes management access or bypasses an existing security control.',
  },
  {
    title: 'Performance Impact',
    focus: 'how latency, throughput, utilization, and device load can change the user experience',
    example: 'Users report slow file transfers, so the technician checks interface errors, congestion, duplex, and path utilization.',
  },
  {
    title: 'Documentation Practice',
    focus: 'what should be recorded so future support work is faster and safer',
    example: 'The final ticket includes the symptom, root cause, commands checked, configuration changed, and validation result.',
  },
  {
    title: 'Change Control',
    focus: 'how to plan, approve, test, and roll back modifications safely',
    example: 'A firewall or switch change is scheduled in a maintenance window with a rollback plan and post-change test checklist.',
  },
  {
    title: 'Troubleshooting Workflow',
    focus: 'how to move from symptom to root cause using repeatable troubleshooting steps',
    example: 'The technician confirms one affected subnet, tests gateway reachability, checks recent changes, and then validates the corrected setting.',
  },
  {
    title: 'Tools and Commands',
    focus: 'which common tools help confirm reachability, resolution, paths, and device state',
    example: 'The team uses ping for reachability, traceroute for path, logs for events, and packet capture when behavior is unclear.',
  },
  {
    title: 'Failure Scenarios',
    focus: 'how the topic behaves when a dependency is missing, misconfigured, or overloaded',
    example: 'A service appears down, but the real issue is a missing route or blocked policy between the client network and server network.',
  },
  {
    title: 'Design Tradeoffs',
    focus: 'the advantages and disadvantages of simpler versus more segmented designs',
    example: 'A small office may prefer fewer segments for support simplicity, while a larger site needs more separation for security and scale.',
  },
  {
    title: 'Operational Handoff',
    focus: 'what another technician needs to know to support the topic after deployment',
    example: 'A handoff note explains expected behavior, monitoring alerts, known dependencies, and escalation contacts.',
  },
  {
    title: 'Review Scenario',
    focus: 'how to combine concepts into a realistic exam-style scenario',
    example: 'A user can reach local resources but not a remote service, so the technician checks local config, gateway, routing, DNS, and policy in order.',
  },
];

function makeExpansionLesson(topic, index) {
  const theme = EXPANSION_THEMES[index % EXPANSION_THEMES.length];
  const lessonNo = index + 1;
  return {
    id: `${topic.id}-deep-${lessonNo}`,
    title: `${topic.name} — ${theme.title}`,
    xp: 50,
    sections: [
      {
        type: 'text',
        content: `${topic.name} requires understanding ${theme.focus}. On the Network+ exam, expect scenario questions that ask you to identify the best next step, not just define a term.`,
      },
      {
        type: 'callout',
        label: 'KEY POINTS',
        content: `• Identify the scope before changing settings.\n• Match the symptom to the correct layer or service.\n• Validate the result after every fix.\n• Document the change so progress is repeatable.`,
      },
      {
        type: 'text',
        content: `Real-world example: ${theme.example}`,
      },
      {
        type: 'prompt',
        question: `When working with ${topic.name}, what is the safest first action in a troubleshooting scenario?`,
        options: [
          'Gather symptoms and identify scope',
          'Replace the primary device immediately',
          'Disable logging to reduce noise',
          'Skip validation if the first test works',
        ],
        correct: 0,
        explanation: 'A structured approach starts by gathering symptoms and identifying scope before making changes.',
      },
    ],
  };
}

function makeExpansionQuestion(topic, index) {
  const n = index + 1;
  return {
    id: `${topic.id}-deep-q${n}`,
    question: `A technician is working on ${topic.name}. Which action best follows Network+ troubleshooting practice?`,
    options: [
      'Change several settings at once to save time',
      'Identify scope, test one theory, validate, and document',
      'Ignore baselines and focus only on user reports',
      'Assume the newest device is always the cause',
    ],
    correct: 1,
    explanation: `${topic.name} scenarios should be handled with a structured process: identify scope, test one theory at a time, validate results, and document the outcome.`,
  };
}

function makeExpansionPBQ(topic, index) {
  const n = index + 1;
  return makeMatchPBQ(
    `pbq-${topic.id}-deep-${n}`,
    `${topic.name} Practice Set ${n}`,
    `Match each ${topic.name} task to the best operational purpose.`,
    [
      { id: `scope-${n}`, label: 'Identify scope' },
      { id: `baseline-${n}`, label: 'Compare baseline' },
      { id: `validate-${n}`, label: 'Validate fix' },
      { id: `document-${n}`, label: 'Document result' },
    ],
    [
      { id: `impact-${n}`, label: 'Find who or what is affected' },
      { id: `normal-${n}`, label: 'Compare against normal behavior' },
      { id: `confirm-${n}`, label: 'Confirm service works' },
      { id: `record-${n}`, label: 'Record final outcome' },
    ],
    {
      [`scope-${n}`]: `impact-${n}`,
      [`baseline-${n}`]: `normal-${n}`,
      [`validate-${n}`]: `confirm-${n}`,
      [`document-${n}`]: `record-${n}`,
    }
  );
}

function expandTopic(topic) {
  const lessons = [...topic.lessons];
  while (lessons.length < 20) lessons.push(makeExpansionLesson(topic, lessons.length));

  const quiz = [...topic.quiz];
  while (quiz.length < 22) quiz.push(makeExpansionQuestion(topic, quiz.length));

  const pbqs = [...topic.pbqs];
  while (pbqs.length < 3) pbqs.push(makeExpansionPBQ(topic, pbqs.length));

  return { ...topic, lessons, quiz, pbqs };
}

function expandTopics(topics) {
  return Object.fromEntries(
    Object.entries(topics).map(([id, topic]) => [id, expandTopic(topic)])
  );
}

const DOMAIN2_TOPICS = {
  vlans: makeTopic({
    id: 'vlans',
    name: 'VLANs & Trunking',
    icon: '🏷️',
    color: '#00d4ff',
    lessons: VLAN_LESSONS,
    quiz: [
      {
        id: 'vlans-q1',
        question: 'A switch port connected to an employee laptop should usually be configured as what type of port?',
        options: ['Trunk', 'Access', 'SPAN', 'Routed'],
        correct: 1,
        explanation: 'End-user devices typically connect to access ports assigned to a single VLAN.',
      },
      {
        id: 'vlans-q2',
        question: 'Which standard inserts VLAN tags into Ethernet frames?',
        options: ['802.1D', '802.1Q', '802.11ax', '802.3af'],
        correct: 1,
        explanation: 'IEEE 802.1Q is the VLAN trunk tagging standard.',
      },
      {
        id: 'vlans-q3',
        question: 'Two hosts in different VLANs need to communicate. What is required?',
        options: ['A crossover cable', 'Inter-VLAN routing', 'A native VLAN only', 'A hub'],
        correct: 1,
        explanation: 'Different VLANs are separate networks, so Layer 3 routing is required.',
      },
    ],
    pbq: makeMatchPBQ(
      'pbq-vlans-1',
      'Match VLAN Components',
      'Match each VLAN term to its purpose.',
      [
        { id: 'access', label: 'Access port' },
        { id: 'trunk', label: 'Trunk port' },
        { id: 'svi', label: 'SVI' },
        { id: 'dot1q', label: '802.1Q' },
      ],
      [
        { id: 'one', label: 'Carries one VLAN' },
        { id: 'many', label: 'Carries multiple VLANs' },
        { id: 'gateway', label: 'Layer 3 VLAN gateway' },
        { id: 'tag', label: 'VLAN frame tagging' },
      ],
      { access: 'one', trunk: 'many', svi: 'gateway', dot1q: 'tag' }
    ),
  }),
  routing: makeTopic({
    id: 'routing',
    name: 'Routing',
    icon: '🧭',
    color: '#7c3aed',
    lessons: [
      makeLesson(
        'routing-1',
        'Static vs Dynamic Routes',
        'Routers forward packets based on destination networks in the routing table. Routes can be manually configured or learned dynamically.',
        [
          ['Static route', 'Manual path', 'Small or controlled networks'],
          ['Default route', 'Gateway of last resort', '0.0.0.0/0'],
          ['OSPF', 'Link-state routing', 'Internal routing'],
          ['BGP', 'Path-vector routing', 'Internet routing'],
        ],
        'A default route is used when no more specific route matches the destination.',
        {
          question: 'Which route is the gateway of last resort?',
          options: ['Host route', 'Default route', 'Connected route', 'Summary route'],
          correct: 1,
          explanation: 'The default route catches traffic when no more specific route exists.',
        }
      ),
      makeLesson(
        'routing-2',
        'Route Selection',
        'Routers prefer the most specific matching route. If prefix lengths tie, administrative distance and metric help choose the best path.',
        [
          ['Longest prefix', 'Most specific match', '/28 beats /24'],
          ['Administrative distance', 'Trust ranking', 'Static beats OSPF'],
          ['Metric', 'Protocol cost', 'Lower is better'],
          ['Next hop', 'Forwarding target', 'Where packet goes next'],
        ],
        'For route selection, longest prefix match comes before metric.',
        {
          question: 'A router has routes to 10.1.1.0/24 and 10.1.1.64/26. Which matches 10.1.1.70?',
          options: ['/24 because it is broader', '/26 because it is more specific', 'Neither route', 'Both are dropped'],
          correct: 1,
          explanation: 'The /26 route is the longest prefix match for 10.1.1.70.',
        }
      ),
    ],
    quiz: [
      {
        id: 'routing-q1',
        question: 'Which routing protocol is commonly used between autonomous systems on the internet?',
        options: ['RIP', 'OSPF', 'BGP', 'EIGRP'],
        correct: 2,
        explanation: 'BGP is the exterior gateway protocol used for internet routing between autonomous systems.',
      },
      {
        id: 'routing-q2',
        question: 'What route is used when no specific route matches a destination?',
        options: ['Default route', 'Host route', 'Loopback route', 'Floating route'],
        correct: 0,
        explanation: 'A default route forwards traffic when no more specific route exists.',
      },
      {
        id: 'routing-q3',
        question: 'Which route is preferred by longest prefix match?',
        options: ['10.0.0.0/8', '10.1.0.0/16', '10.1.2.0/24', '0.0.0.0/0'],
        correct: 2,
        explanation: 'The /24 route is the most specific route listed.',
      },
    ],
    pbq: makeMatchPBQ(
      'pbq-routing-1',
      'Match Routing Terms',
      'Match each routing item to its description.',
      [
        { id: 'static', label: 'Static route' },
        { id: 'default', label: 'Default route' },
        { id: 'ospf', label: 'OSPF' },
        { id: 'bgp', label: 'BGP' },
      ],
      [
        { id: 'manual', label: 'Manually configured path' },
        { id: 'fallback', label: 'Gateway of last resort' },
        { id: 'igp', label: 'Internal link-state routing' },
        { id: 'egp', label: 'Internet path-vector routing' },
      ],
      { static: 'manual', default: 'fallback', ospf: 'igp', bgp: 'egp' }
    ),
  }),
  switching: makeTopic({
    id: 'switching',
    name: 'Switching',
    icon: '🔀',
    color: '#10b981',
    lessons: [
      makeLesson(
        'switching-1',
        'MAC Learning',
        'Switches learn source MAC addresses and build a MAC address table. They forward frames based on destination MAC addresses.',
        [
          ['MAC table', 'Maps MAC to switch port', 'Layer 2 forwarding'],
          ['Unknown unicast', 'Destination not learned', 'Flooded out ports'],
          ['Broadcast', 'FF:FF:FF:FF:FF:FF', 'Sent to all ports in VLAN'],
          ['Aging timer', 'Removes stale entries', 'Keeps table current'],
        ],
        'A switch floods unknown destinations, but forwards known destinations only to the learned port.',
        {
          question: 'What does a switch use to make forwarding decisions?',
          options: ['IP address', 'MAC address', 'Port number', 'URL'],
          correct: 1,
          explanation: 'Switches operate at Layer 2 and forward frames using MAC addresses.',
        }
      ),
      makeLesson(
        'switching-2',
        'Loop Prevention',
        'Redundant switch links can create loops. Spanning Tree Protocol blocks selected paths to keep a loop-free topology.',
        [
          ['STP', 'Prevents Layer 2 loops', 'Blocks redundant links'],
          ['Root bridge', 'Reference switch', 'Lowest bridge ID wins'],
          ['BPDU', 'STP control message', 'Exchanged between switches'],
          ['PortFast', 'Fast edge-port transition', 'Use on end-host ports'],
        ],
        'Use PortFast only on access ports connected to end devices, not switch-to-switch trunks.',
        {
          question: 'Which protocol prevents Layer 2 switching loops?',
          options: ['OSPF', 'STP', 'NTP', 'SNMP'],
          correct: 1,
          explanation: 'Spanning Tree Protocol prevents Layer 2 loops by blocking redundant paths.',
        }
      ),
    ],
    quiz: [
      {
        id: 'switching-q1',
        question: 'A switch receives a frame for an unknown destination MAC. What does it do?',
        options: ['Drops it', 'Routes it', 'Floods it within the VLAN', 'Sends it to DNS'],
        correct: 2,
        explanation: 'Unknown unicast frames are flooded within the VLAN.',
      },
      {
        id: 'switching-q2',
        question: 'What STP role is the central reference point for path calculations?',
        options: ['Root bridge', 'Default gateway', 'DHCP server', 'Proxy server'],
        correct: 0,
        explanation: 'STP elects a root bridge and calculates loop-free paths from it.',
      },
      {
        id: 'switching-q3',
        question: 'Which table maps MAC addresses to switch ports?',
        options: ['ARP table', 'Routing table', 'MAC address table', 'DNS cache'],
        correct: 2,
        explanation: 'A switch maintains a MAC address table for Layer 2 forwarding.',
      },
    ],
    pbq: makeMatchPBQ(
      'pbq-switching-1',
      'Match Switching Concepts',
      'Match each switching term to its role.',
      [
        { id: 'mac', label: 'MAC table' },
        { id: 'flood', label: 'Unknown unicast' },
        { id: 'stp', label: 'STP' },
        { id: 'bpdu', label: 'BPDU' },
      ],
      [
        { id: 'forward', label: 'Maps MACs to ports' },
        { id: 'unknown', label: 'Flooded in VLAN' },
        { id: 'loop', label: 'Prevents loops' },
        { id: 'control', label: 'STP control frame' },
      ],
      { mac: 'forward', flood: 'unknown', stp: 'loop', bpdu: 'control' }
    ),
  }),
  wireless: makeTopic({
    id: 'wireless',
    name: 'Wireless Setup',
    icon: '📶',
    color: '#f59e0b',
    lessons: [
      makeLesson(
        'wireless-1',
        'Wi-Fi Bands and Channels',
        'Wireless networks use radio bands and channels. Proper channel planning reduces interference and improves performance.',
        [
          ['2.4 GHz', 'Longer range', 'More interference'],
          ['5 GHz', 'Higher throughput', 'Shorter range'],
          ['6 GHz', 'New spectrum', 'Wi-Fi 6E/7'],
          ['Channel overlap', 'Adjacent interference', 'Plan non-overlapping channels'],
        ],
        '2.4 GHz has better range but fewer clean channels. 5 GHz has more channels and less interference.',
        {
          question: 'Which band generally offers longer range but more interference?',
          options: ['2.4 GHz', '5 GHz', '6 GHz', '60 GHz'],
          correct: 0,
          explanation: '2.4 GHz travels farther but is crowded and more prone to interference.',
        }
      ),
      makeLesson(
        'wireless-2',
        'Security and Roaming',
        'Wireless security protects authentication and encryption. Enterprise WLANs often use centralized authentication and roaming support.',
        [
          ['WPA2/WPA3-Personal', 'Pre-shared key', 'Home/small office'],
          ['WPA2/WPA3-Enterprise', '802.1X authentication', 'RADIUS-backed login'],
          ['SSID', 'Network name', 'Can be broadcast or hidden'],
          ['Roaming', 'Client moves APs', 'Coverage overlap matters'],
        ],
        'For business authentication, think WPA Enterprise with 802.1X and RADIUS.',
        {
          question: 'Which authentication method is common in enterprise Wi-Fi?',
          options: ['WEP shared key', '802.1X with RADIUS', 'Open authentication only', 'MAC filtering only'],
          correct: 1,
          explanation: 'Enterprise Wi-Fi commonly uses 802.1X backed by a RADIUS server.',
        }
      ),
    ],
    quiz: [
      {
        id: 'wireless-q1',
        question: 'Which Wi-Fi band is most likely to have the best range through walls?',
        options: ['2.4 GHz', '5 GHz', '6 GHz', '60 GHz'],
        correct: 0,
        explanation: 'Lower frequencies like 2.4 GHz generally travel farther and penetrate walls better.',
      },
      {
        id: 'wireless-q2',
        question: 'What service commonly backs 802.1X wireless authentication?',
        options: ['DNS', 'RADIUS', 'NTP', 'TFTP'],
        correct: 1,
        explanation: 'RADIUS commonly provides centralized authentication for 802.1X.',
      },
      {
        id: 'wireless-q3',
        question: 'What is the name clients see when choosing a Wi-Fi network?',
        options: ['BSSID', 'SSID', 'VLAN ID', 'Gateway'],
        correct: 1,
        explanation: 'The SSID is the wireless network name.',
      },
    ],
    pbq: makeMatchPBQ(
      'pbq-wireless-1',
      'Match Wireless Terms',
      'Match each wireless concept to the best description.',
      [
        { id: 'ssid', label: 'SSID' },
        { id: 'radius', label: 'RADIUS' },
        { id: 'twofour', label: '2.4 GHz' },
        { id: 'five', label: '5 GHz' },
      ],
      [
        { id: 'name', label: 'Wireless network name' },
        { id: 'auth', label: 'Central authentication' },
        { id: 'range', label: 'Longer range' },
        { id: 'speed', label: 'More channels/throughput' },
      ],
      { ssid: 'name', radius: 'auth', twofour: 'range', five: 'speed' }
    ),
  }),
};

const DOMAIN3_TOPICS = {
  monitoring: makeTopic({
    id: 'monitoring',
    name: 'Monitoring',
    icon: '📈',
    color: '#00d4ff',
    lessons: [
      makeLesson('monitoring-1', 'Baselines and Alerts', 'Monitoring compares current behavior against normal baselines so teams can detect abnormal performance.', [['Baseline', 'Normal performance reference', 'Know what changed'], ['Threshold', 'Alert trigger', 'CPU, bandwidth, latency'], ['Dashboard', 'Live visibility', 'Operational status'], ['Alert fatigue', 'Too many alerts', 'Tune thresholds']], 'A baseline is only useful when captured during normal operation.', { question: 'What does a performance baseline represent?', options: ['Normal expected behavior', 'A failed backup', 'A malware signature', 'A VLAN tag'], correct: 0, explanation: 'A baseline documents normal performance so deviations can be detected.' }),
      makeLesson('monitoring-2', 'Availability Metrics', 'Operations teams track uptime, latency, packet loss, and utilization to maintain service levels.', [['Uptime', 'Service availability', 'SLA target'], ['Latency', 'Delay', 'Voice/video impact'], ['Packet loss', 'Dropped traffic', 'Congestion or errors'], ['Utilization', 'Capacity usage', 'Bandwidth planning']], 'High utilization plus packet loss usually points to congestion or errors.', { question: 'Which metric measures delay across the network?', options: ['Latency', 'MTU', 'SSID', 'TTL'], correct: 0, explanation: 'Latency is the time traffic takes to travel between endpoints.' }),
    ],
    quiz: [
      { id: 'monitoring-q1', question: 'Why do administrators create baselines?', options: ['To encrypt traffic', 'To identify abnormal behavior', 'To assign VLANs', 'To resolve hostnames'], correct: 1, explanation: 'Baselines help identify when current behavior differs from normal operation.' },
      { id: 'monitoring-q2', question: 'Which metric is most directly tied to service availability?', options: ['Uptime', 'SSID', 'Subnet mask', 'Port number'], correct: 0, explanation: 'Uptime measures whether a service is available.' },
      { id: 'monitoring-q3', question: 'Too many low-value alerts can create what problem?', options: ['Alert fatigue', 'VLAN hopping', 'Route poisoning', 'Split horizon'], correct: 0, explanation: 'Alert fatigue happens when noisy alerting causes important events to be missed.' },
    ],
    pbq: makeMatchPBQ('pbq-monitoring-1', 'Match Monitoring Metrics', 'Match each metric to what it measures.', [{ id: 'latency', label: 'Latency' }, { id: 'uptime', label: 'Uptime' }, { id: 'loss', label: 'Packet loss' }, { id: 'util', label: 'Utilization' }], [{ id: 'delay', label: 'Delay' }, { id: 'available', label: 'Availability' }, { id: 'drops', label: 'Dropped packets' }, { id: 'capacity', label: 'Capacity usage' }], { latency: 'delay', uptime: 'available', loss: 'drops', util: 'capacity' }),
  }),
  logs: makeTopic({
    id: 'logs',
    name: 'Logs',
    icon: '🧾',
    color: '#7c3aed',
    lessons: [
      makeLesson('logs-1', 'Centralized Logging', 'Logs provide records of events, errors, authentication attempts, and configuration changes.', [['Syslog', 'Network event logging', 'UDP/TCP 514'], ['SIEM', 'Correlation and search', 'Security operations'], ['Retention', 'How long logs are kept', 'Compliance'], ['Timestamp', 'Event timing', 'Requires NTP']], 'Bad time sync makes log correlation difficult. NTP matters for operations.', { question: 'Which protocol is commonly used for network device logging?', options: ['Syslog', 'DHCP', 'ARP', 'RTP'], correct: 0, explanation: 'Syslog is commonly used to send logs from network devices to a collector.' }),
      makeLesson('logs-2', 'Reading Events', 'Effective troubleshooting requires reading event severity, source, timestamps, and repeated patterns.', [['Severity', 'Event importance', 'Emergency to debug'], ['Source', 'Device or service', 'Where it happened'], ['Correlation', 'Connect related events', 'Find root cause'], ['Rotation', 'Manage log size', 'Prevent full disks']], 'A repeated authentication failure followed by a lockout points to credential or attack issues.', { question: 'What makes logs easier to correlate across devices?', options: ['NTP time sync', 'Different time zones per device', 'Disabling timestamps', 'Deleting old logs immediately'], correct: 0, explanation: 'Time synchronization makes events line up accurately across devices.' }),
    ],
    quiz: [
      { id: 'logs-q1', question: 'What system commonly correlates logs from many sources?', options: ['SIEM', 'DHCP', 'NAT', 'STP'], correct: 0, explanation: 'A SIEM collects and correlates logs from many devices and applications.' },
      { id: 'logs-q2', question: 'Why is NTP important for log analysis?', options: ['It encrypts logs', 'It syncs timestamps', 'It blocks malware', 'It assigns IP addresses'], correct: 1, explanation: 'NTP keeps device clocks synchronized for accurate timeline analysis.' },
      { id: 'logs-q3', question: 'Which field helps identify where an event happened?', options: ['Source', 'TTL', 'MTU', 'VLAN tag'], correct: 0, explanation: 'The source identifies the device, host, application, or service that generated the log.' },
    ],
    pbq: makeMatchPBQ('pbq-logs-1', 'Match Log Terms', 'Match each logging term to its role.', [{ id: 'syslog', label: 'Syslog' }, { id: 'siem', label: 'SIEM' }, { id: 'retention', label: 'Retention' }, { id: 'severity', label: 'Severity' }], [{ id: 'send', label: 'Sends network logs' }, { id: 'correlate', label: 'Correlates events' }, { id: 'keep', label: 'How long logs are stored' }, { id: 'importance', label: 'Event importance' }], { syslog: 'send', siem: 'correlate', retention: 'keep', severity: 'importance' }),
  }),
  snmp: makeTopic({
    id: 'snmp',
    name: 'SNMP',
    icon: '📡',
    color: '#10b981',
    lessons: [
      makeLesson('snmp-1', 'Polling and Traps', 'SNMP lets monitoring systems query devices and receive alerts from network equipment.', [['Manager', 'Monitoring server', 'Polls agents'], ['Agent', 'Device service', 'Responds with metrics'], ['OID', 'Metric identifier', 'CPU, interface status'], ['Trap', 'Device-sent alert', 'Uses port 162']], 'SNMP polling uses port 161; traps go to port 162.', { question: 'Which SNMP message is sent by a device as an alert?', options: ['Trap', 'Discover', 'Offer', 'ACK'], correct: 0, explanation: 'An SNMP trap is an alert sent from an agent to a manager.' }),
      makeLesson('snmp-2', 'Versions and Security', 'SNMP versions differ in security. SNMPv3 adds authentication and encryption.', [['SNMPv1', 'Legacy', 'Community strings'], ['SNMPv2c', 'Common but weak', 'Community strings'], ['SNMPv3', 'Secure option', 'Auth and privacy'], ['Community string', 'Shared text', 'Treat like a password']], 'Use SNMPv3 when possible because it supports authentication and encryption.', { question: 'Which SNMP version supports authentication and encryption?', options: ['SNMPv1', 'SNMPv2c', 'SNMPv3', 'All versions equally'], correct: 2, explanation: 'SNMPv3 adds authentication and privacy features.' }),
    ],
    quiz: [
      { id: 'snmp-q1', question: 'What UDP port is used for SNMP polling?', options: ['53', '123', '161', '162'], correct: 2, explanation: 'SNMP polling uses UDP port 161.' },
      { id: 'snmp-q2', question: 'What UDP port receives SNMP traps?', options: ['161', '162', '389', '514'], correct: 1, explanation: 'SNMP traps are sent to UDP port 162.' },
      { id: 'snmp-q3', question: 'Which SNMP version is preferred for security?', options: ['SNMPv1', 'SNMPv2c', 'SNMPv3', 'SNMP Lite'], correct: 2, explanation: 'SNMPv3 supports authentication and encryption.' },
    ],
    pbq: makeMatchPBQ('pbq-snmp-1', 'Match SNMP Components', 'Match each SNMP item to its function.', [{ id: 'manager', label: 'Manager' }, { id: 'agent', label: 'Agent' }, { id: 'oid', label: 'OID' }, { id: 'trap', label: 'Trap' }], [{ id: 'monitor', label: 'Monitoring server' }, { id: 'device', label: 'Device service' }, { id: 'metric', label: 'Metric identifier' }, { id: 'alert', label: 'Device alert' }], { manager: 'monitor', agent: 'device', oid: 'metric', trap: 'alert' }),
  }),
  backups: makeTopic({
    id: 'backups',
    name: 'Backups & Continuity',
    icon: '💾',
    color: '#f59e0b',
    lessons: [
      makeLesson('backups-1', 'Backup Types', 'Backups protect data and configurations from loss. Different backup types trade speed, storage, and restore complexity.', [['Full', 'Everything', 'Fastest restore'], ['Incremental', 'Changes since last backup', 'Least storage'], ['Differential', 'Changes since last full', 'Middle ground'], ['Snapshot', 'Point-in-time image', 'Fast rollback']], 'Always test restores. A backup that cannot restore is not useful.', { question: 'Which backup captures changes since the last full backup?', options: ['Full', 'Incremental', 'Differential', 'Loopback'], correct: 2, explanation: 'A differential backup captures changes since the most recent full backup.' }),
      makeLesson('backups-2', 'Recovery Objectives', 'Business continuity planning defines how much data loss and downtime are acceptable.', [['RPO', 'Maximum acceptable data loss', 'How much can be lost'], ['RTO', 'Maximum acceptable downtime', 'How long to recover'], ['Failover', 'Move service to standby', 'High availability'], ['DR test', 'Validate the plan', 'Practice recovery']], 'RPO is about data loss. RTO is about time to restore service.', { question: 'Which objective defines maximum acceptable downtime?', options: ['RPO', 'RTO', 'MTU', 'TTL'], correct: 1, explanation: 'RTO defines how long recovery can take before business impact becomes unacceptable.' }),
    ],
    quiz: [
      { id: 'backups-q1', question: 'Which backup type usually requires the least storage each run?', options: ['Full', 'Incremental', 'Differential', 'Mirror only'], correct: 1, explanation: 'Incremental backups store only changes since the last backup.' },
      { id: 'backups-q2', question: 'What does RPO define?', options: ['Allowed data loss', 'Allowed downtime', 'Packet size', 'Port speed'], correct: 0, explanation: 'RPO is the recovery point objective: maximum acceptable data loss.' },
      { id: 'backups-q3', question: 'What validates that backup data can actually be recovered?', options: ['Restore test', 'SSID scan', 'VLAN tag', 'ARP request'], correct: 0, explanation: 'Restore testing proves backups are usable.' },
    ],
    pbq: makeMatchPBQ('pbq-backups-1', 'Match Continuity Terms', 'Match each term to its meaning.', [{ id: 'full', label: 'Full backup' }, { id: 'inc', label: 'Incremental backup' }, { id: 'rpo', label: 'RPO' }, { id: 'rto', label: 'RTO' }], [{ id: 'all', label: 'Backs up everything' }, { id: 'changes', label: 'Backs up recent changes' }, { id: 'loss', label: 'Acceptable data loss' }, { id: 'downtime', label: 'Acceptable downtime' }], { full: 'all', inc: 'changes', rpo: 'loss', rto: 'downtime' }),
  }),
};

const DOMAIN4_TOPICS = {
  firewalls: makeTopic({
    id: 'firewalls',
    name: 'Firewalls',
    icon: '🧱',
    color: '#00d4ff',
    lessons: [
      makeLesson('firewalls-1', 'Firewall Rules', 'Firewalls permit or deny traffic based on criteria such as IP address, port, protocol, and application.', [['ACL', 'Ordered rule list', 'Top-down matching'], ['Implicit deny', 'Default block', 'If no rule matches'], ['Stateful firewall', 'Tracks sessions', 'Allows return traffic'], ['NGFW', 'App-aware filtering', 'Layer 7 controls']], 'Firewall rules are processed in order. Place specific rules before broad rules.', { question: 'What happens when no firewall rule matches and implicit deny is active?', options: ['Traffic is allowed', 'Traffic is blocked', 'Traffic is encrypted', 'Traffic is routed by DNS'], correct: 1, explanation: 'Implicit deny blocks traffic unless an explicit allow rule matches.' }),
      makeLesson('firewalls-2', 'Network Placement', 'Firewall placement controls trust boundaries between users, servers, internet, and DMZ services.', [['Perimeter', 'Internet edge', 'North-south traffic'], ['Internal segmentation', 'Between internal zones', 'East-west traffic'], ['DMZ', 'Public-facing services', 'Limited trust zone'], ['Host firewall', 'Endpoint filtering', 'Device-local rules']], 'A DMZ exposes public services while limiting access to internal networks.', { question: 'Where are public web servers commonly placed?', options: ['DMZ', 'Native VLAN', 'Loopback network', 'AP management channel'], correct: 0, explanation: 'A DMZ is commonly used for internet-facing services.' }),
    ],
    quiz: [
      { id: 'firewalls-q1', question: 'Which firewall type tracks connection state?', options: ['Stateless', 'Stateful', 'Hub-based', 'Passive tap'], correct: 1, explanation: 'Stateful firewalls track active sessions and allow related return traffic.' },
      { id: 'firewalls-q2', question: 'What is an implicit deny?', options: ['Allow all traffic', 'Block unmatched traffic', 'Encrypt all packets', 'Translate IP addresses'], correct: 1, explanation: 'Implicit deny blocks traffic that does not match an allow rule.' },
      { id: 'firewalls-q3', question: 'What zone is commonly used for public-facing servers?', options: ['DMZ', 'Management VLAN only', 'Loopback', 'APIPA'], correct: 0, explanation: 'A DMZ hosts public services while limiting exposure to internal systems.' },
    ],
    pbq: makeMatchPBQ('pbq-firewalls-1', 'Match Firewall Terms', 'Match each firewall term to its purpose.', [{ id: 'acl', label: 'ACL' }, { id: 'implicit', label: 'Implicit deny' }, { id: 'stateful', label: 'Stateful' }, { id: 'dmz', label: 'DMZ' }], [{ id: 'rules', label: 'Ordered rule list' }, { id: 'block', label: 'Blocks unmatched traffic' }, { id: 'sessions', label: 'Tracks sessions' }, { id: 'public', label: 'Public service zone' }], { acl: 'rules', implicit: 'block', stateful: 'sessions', dmz: 'public' }),
  }),
  encryption: makeTopic({
    id: 'encryption',
    name: 'Encryption',
    icon: '🔐',
    color: '#7c3aed',
    lessons: [
      makeLesson('encryption-1', 'Symmetric and Asymmetric', 'Encryption protects confidentiality. Symmetric encryption uses one shared key; asymmetric encryption uses public and private keys.', [['Symmetric', 'One shared key', 'Fast bulk encryption'], ['Asymmetric', 'Public/private key pair', 'Key exchange and identity'], ['Hashing', 'One-way digest', 'Integrity check'], ['Certificate', 'Binds identity to public key', 'PKI trust']], 'TLS often uses asymmetric crypto to establish trust and symmetric crypto for bulk data transfer.', { question: 'Which encryption type uses the same key to encrypt and decrypt?', options: ['Symmetric', 'Asymmetric', 'Hashing', 'Tokenization only'], correct: 0, explanation: 'Symmetric encryption uses one shared key for encryption and decryption.' }),
      makeLesson('encryption-2', 'PKI and Certificates', 'PKI uses certificate authorities, certificates, and trust chains to validate identities.', [['CA', 'Issues certificates', 'Trusted authority'], ['CSR', 'Certificate request', 'Contains public key info'], ['CRL/OCSP', 'Revocation checking', 'Is cert still valid'], ['Private key', 'Secret key material', 'Must be protected']], 'Never share a private key. Certificates contain public key information.', { question: 'What entity issues trusted certificates?', options: ['Certificate authority', 'DHCP server', 'NAT gateway', 'Syslog collector'], correct: 0, explanation: 'A certificate authority issues and signs certificates.' }),
    ],
    quiz: [
      { id: 'encryption-q1', question: 'Which process verifies data has not changed?', options: ['Hashing', 'Routing', 'NAT', 'DHCP'], correct: 0, explanation: 'Hashing creates a digest used to verify integrity.' },
      { id: 'encryption-q2', question: 'Which key must remain secret in asymmetric cryptography?', options: ['Public key', 'Private key', 'Certificate serial number', 'CSR'], correct: 1, explanation: 'The private key must be protected and never shared.' },
      { id: 'encryption-q3', question: 'What does a certificate bind to an identity?', options: ['Public key', 'VLAN ID', 'Subnet mask', 'SNMP community'], correct: 0, explanation: 'A certificate binds an identity to a public key.' },
    ],
    pbq: makeMatchPBQ('pbq-encryption-1', 'Match Crypto Terms', 'Match each crypto term to its use.', [{ id: 'sym', label: 'Symmetric' }, { id: 'asym', label: 'Asymmetric' }, { id: 'hash', label: 'Hashing' }, { id: 'ca', label: 'CA' }], [{ id: 'shared', label: 'Shared key' }, { id: 'pair', label: 'Key pair' }, { id: 'integrity', label: 'Integrity digest' }, { id: 'certs', label: 'Issues certificates' }], { sym: 'shared', asym: 'pair', hash: 'integrity', ca: 'certs' }),
  }),
  vpns: makeTopic({
    id: 'vpns',
    name: 'VPNs',
    icon: '🛜',
    color: '#10b981',
    lessons: [
      makeLesson('vpns-1', 'Remote Access VPNs', 'Remote access VPNs let individual users securely connect to internal resources over untrusted networks.', [['Client VPN', 'User-to-site tunnel', 'Remote workers'], ['Split tunnel', 'Some traffic through VPN', 'Less bandwidth'], ['Full tunnel', 'All traffic through VPN', 'More control'], ['MFA', 'Extra login factor', 'Better identity security']], 'Use MFA with VPN access because VPN credentials are high-value targets.', { question: 'Which VPN mode sends all client traffic through the VPN?', options: ['Split tunnel', 'Full tunnel', 'Bridge mode', 'Monitor mode'], correct: 1, explanation: 'Full tunnel routes all traffic through the VPN.' }),
      makeLesson('vpns-2', 'Site-to-Site VPNs', 'Site-to-site VPNs connect networks at different locations, often using IPsec tunnels between gateways.', [['IPsec', 'Layer 3 VPN suite', 'Site-to-site security'], ['IKE', 'Negotiates tunnel settings', 'Key exchange'], ['Tunnel mode', 'Encapsulates packets', 'Gateway-to-gateway'], ['Pre-shared key', 'Shared secret', 'Common authentication method']], 'Site-to-site VPNs usually connect network gateways, not individual user devices.', { question: 'Which VPN style connects two branch networks?', options: ['Site-to-site', 'Clientless portal only', 'Bluetooth PAN', 'Ad hoc Wi-Fi'], correct: 0, explanation: 'A site-to-site VPN connects networks through VPN gateways.' }),
    ],
    quiz: [
      { id: 'vpns-q1', question: 'What VPN type is commonly used by remote employees?', options: ['Remote access VPN', 'STP tunnel', 'DHCP relay', 'SPAN session'], correct: 0, explanation: 'Remote access VPNs connect individual users to internal resources.' },
      { id: 'vpns-q2', question: 'What VPN technology is common for secure site-to-site tunnels?', options: ['IPsec', 'ARP', 'LLDP', 'NTP'], correct: 0, explanation: 'IPsec is commonly used for secure Layer 3 VPN tunnels.' },
      { id: 'vpns-q3', question: 'Which control strengthens VPN login security?', options: ['MFA', 'Lower MTU only', 'Disabling logs', 'Open authentication'], correct: 0, explanation: 'MFA adds a second factor and reduces risk from stolen passwords.' },
    ],
    pbq: makeMatchPBQ('pbq-vpns-1', 'Match VPN Terms', 'Match each VPN term to its meaning.', [{ id: 'remote', label: 'Remote access' }, { id: 'site', label: 'Site-to-site' }, { id: 'split', label: 'Split tunnel' }, { id: 'full', label: 'Full tunnel' }], [{ id: 'user', label: 'Individual user tunnel' }, { id: 'branch', label: 'Branch network tunnel' }, { id: 'some', label: 'Some traffic via VPN' }, { id: 'all', label: 'All traffic via VPN' }], { remote: 'user', site: 'branch', split: 'some', full: 'all' }),
  }),
  accesscontrol: makeTopic({
    id: 'accesscontrol',
    name: 'Access Control',
    icon: '🪪',
    color: '#f59e0b',
    lessons: [
      makeLesson('accesscontrol-1', 'AAA', 'AAA defines how users prove identity, what they can access, and how activity is tracked.', [['Authentication', 'Who are you?', 'Identity proof'], ['Authorization', 'What can you access?', 'Permissions'], ['Accounting', 'What did you do?', 'Auditing'], ['RADIUS/TACACS+', 'Central AAA', 'Network device login']], 'Authentication comes before authorization. Accounting records activity.', { question: 'Which AAA function records what a user did?', options: ['Authentication', 'Authorization', 'Accounting', 'Addressing'], correct: 2, explanation: 'Accounting logs user activity for auditing.' }),
      makeLesson('accesscontrol-2', 'Least Privilege', 'Least privilege gives users only the access needed to perform their jobs.', [['RBAC', 'Role-based permissions', 'Access by job role'], ['ACL', 'Rule-based access', 'Permit/deny'], ['MFA', 'Multiple factors', 'Stronger authentication'], ['Disable stale accounts', 'Remove unused access', 'Reduce attack surface']], 'Review access regularly and remove permissions that are no longer needed.', { question: 'Which access model assigns permissions based on job role?', options: ['RBAC', 'NAT', 'STP', 'DNS'], correct: 0, explanation: 'Role-based access control assigns permissions according to job roles.' }),
    ],
    quiz: [
      { id: 'accesscontrol-q1', question: 'In AAA, what does authorization determine?', options: ['Who the user is', 'What the user can access', 'What IP address to assign', 'What cable is used'], correct: 1, explanation: 'Authorization determines what an authenticated user is allowed to access.' },
      { id: 'accesscontrol-q2', question: 'What principle limits users to only needed permissions?', options: ['Least privilege', 'Implicit allow', 'Broadcast flooding', 'Route summarization'], correct: 0, explanation: 'Least privilege reduces risk by minimizing unnecessary access.' },
      { id: 'accesscontrol-q3', question: 'Which protocol is commonly used for centralized network authentication?', options: ['RADIUS', 'ARP', 'ICMP', 'RTP'], correct: 0, explanation: 'RADIUS is commonly used for centralized authentication and authorization.' },
    ],
    pbq: makeMatchPBQ('pbq-accesscontrol-1', 'Match AAA Terms', 'Match each AAA term to the right question.', [{ id: 'authn', label: 'Authentication' }, { id: 'authz', label: 'Authorization' }, { id: 'acct', label: 'Accounting' }, { id: 'rbac', label: 'RBAC' }], [{ id: 'who', label: 'Who are you?' }, { id: 'what', label: 'What can you access?' }, { id: 'did', label: 'What did you do?' }, { id: 'role', label: 'Access by job role' }], { authn: 'who', authz: 'what', acct: 'did', rbac: 'role' }),
  }),
};

const DOMAIN5_TOPICS = {
  commonissues: makeTopic({
    id: 'commonissues',
    name: 'Common Issues',
    icon: '🚧',
    color: '#00d4ff',
    lessons: [
      makeLesson('commonissues-1', 'Connectivity Symptoms', 'Troubleshooting starts by identifying the scope and symptom: one user, one subnet, one service, or everyone.', [['No link light', 'Layer 1 issue', 'Cable, NIC, port'], ['APIPA address', 'DHCP failure', '169.254.x.x'], ['Can ping IP not name', 'DNS issue', 'Name resolution'], ['High latency', 'Delay', 'Congestion or path issue']], 'Scope matters: one host points local; many hosts point shared infrastructure.', { question: 'A host has a 169.254.x.x address. What likely failed?', options: ['DHCP', 'DNS', 'NTP', 'SNMP'], correct: 0, explanation: 'APIPA addresses are self-assigned when DHCP fails.' }),
      makeLesson('commonissues-2', 'Performance Problems', 'Performance issues often involve congestion, duplex mismatch, wireless interference, or overloaded devices.', [['Congestion', 'Too much traffic', 'High utilization'], ['Duplex mismatch', 'Errors and poor throughput', 'Check interface settings'], ['Interference', 'Wireless drops', 'Channel planning'], ['Resource exhaustion', 'CPU or memory high', 'Device overload']], 'Interface errors plus poor throughput can indicate cabling or duplex problems.', { question: 'What wireless issue can cause drops and retries?', options: ['Interference', 'RPO', 'Implicit deny', 'CSR'], correct: 0, explanation: 'Wireless interference causes retransmissions, drops, and poor performance.' }),
    ],
    quiz: [
      { id: 'commonissues-q1', question: 'A client can ping 8.8.8.8 but cannot browse by name. What is the likely issue?', options: ['DNS', 'Cable unplugged', 'Bad NIC driver', 'Wrong VLAN only'], correct: 0, explanation: 'IP connectivity works, but name resolution fails, pointing to DNS.' },
      { id: 'commonissues-q2', question: 'What does APIPA indicate?', options: ['DHCP failure', 'Successful DNS lookup', 'Valid public IP', 'Working default gateway'], correct: 0, explanation: 'APIPA addresses are assigned when DHCP cannot provide an address.' },
      { id: 'commonissues-q3', question: 'Which issue is most associated with interface errors and poor throughput?', options: ['Duplex mismatch', 'Valid certificate', 'Correct route', 'Low latency'], correct: 0, explanation: 'Duplex mismatch can cause collisions/errors and degraded throughput.' },
    ],
    pbq: makeMatchPBQ('pbq-commonissues-1', 'Match Symptoms to Causes', 'Match each symptom to the likely cause.', [{ id: 'apipa', label: '169.254.x.x' }, { id: 'name', label: 'IP works, names fail' }, { id: 'nolink', label: 'No link light' }, { id: 'slow', label: 'High utilization' }], [{ id: 'dhcp', label: 'DHCP failure' }, { id: 'dns', label: 'DNS issue' }, { id: 'physical', label: 'Layer 1 issue' }, { id: 'congestion', label: 'Congestion' }], { apipa: 'dhcp', name: 'dns', nolink: 'physical', slow: 'congestion' }),
  }),
  tools: makeTopic({
    id: 'tools',
    name: 'Tools',
    icon: '🧰',
    color: '#7c3aed',
    lessons: [
      makeLesson('tools-1', 'Command-Line Tools', 'Network tools test reachability, routes, DNS, and active connections.', [['ping', 'Reachability test', 'ICMP echo'], ['traceroute/tracert', 'Path discovery', 'Hop-by-hop route'], ['nslookup/dig', 'DNS testing', 'Name resolution'], ['netstat/ss', 'Connection view', 'Listening ports']], 'Use ping for reachability, traceroute for path, and nslookup/dig for DNS.', { question: 'Which tool shows the path packets take across routers?', options: ['traceroute', 'nslookup', 'ipconfig', 'netstat'], correct: 0, explanation: 'Traceroute/tracert displays hop-by-hop path information.' }),
      makeLesson('tools-2', 'Hardware and Wireless Tools', 'Physical and wireless tools help validate cabling, signal, and spectrum problems.', [['Cable tester', 'Wire map and faults', 'Copper validation'], ['Toner/probe', 'Trace cable runs', 'Locate cable'], ['Wi-Fi analyzer', 'SSID/channel/signal', 'Wireless planning'], ['Packet capture', 'Inspect traffic', 'Protocol analysis']], 'A cable tester verifies wiring faults; a toner identifies where a cable goes.', { question: 'Which tool identifies the location of a cable in a bundle?', options: ['Toner and probe', 'Packet sniffer', 'RADIUS server', 'NTP client'], correct: 0, explanation: 'A toner and probe help trace cable runs.' }),
    ],
    quiz: [
      { id: 'tools-q1', question: 'Which command tests DNS resolution?', options: ['nslookup', 'ping', 'arp', 'netstat'], correct: 0, explanation: 'nslookup tests DNS name resolution.' },
      { id: 'tools-q2', question: 'Which tool verifies copper cable wiring?', options: ['Cable tester', 'SIEM', 'RADIUS', 'Load balancer'], correct: 0, explanation: 'A cable tester checks wiring faults and continuity.' },
      { id: 'tools-q3', question: 'Which tool captures and inspects network frames or packets?', options: ['Packet analyzer', 'Crimper', 'Tone generator only', 'DHCP relay'], correct: 0, explanation: 'A packet analyzer captures traffic for protocol analysis.' },
    ],
    pbq: makeMatchPBQ('pbq-tools-1', 'Match Tools to Tasks', 'Match each troubleshooting tool to its task.', [{ id: 'ping', label: 'ping' }, { id: 'trace', label: 'traceroute' }, { id: 'dns', label: 'nslookup' }, { id: 'cable', label: 'Cable tester' }], [{ id: 'reach', label: 'Reachability' }, { id: 'path', label: 'Path hops' }, { id: 'resolve', label: 'DNS lookup' }, { id: 'wire', label: 'Wire faults' }], { ping: 'reach', trace: 'path', dns: 'resolve', cable: 'wire' }),
  }),
  diagnosis: makeTopic({
    id: 'diagnosis',
    name: 'Diagnosis Steps',
    icon: '🩺',
    color: '#10b981',
    lessons: [
      makeLesson('diagnosis-1', 'Troubleshooting Methodology', 'A structured process prevents guessing and helps document results.', [['Identify problem', 'Gather symptoms', 'Question users'], ['Establish theory', 'Likely cause', 'Start simple'], ['Test theory', 'Confirm or reject', 'Escalate if needed'], ['Document findings', 'Record fix', 'Knowledge reuse']], 'Always identify scope and recent changes before changing configurations.', { question: 'What should you do after confirming a theory?', options: ['Establish a plan of action', 'Ignore documentation', 'Replace all devices', 'Disable monitoring'], correct: 0, explanation: 'After confirming the cause, establish a plan of action and implement the solution.' }),
      makeLesson('diagnosis-2', 'Layered Troubleshooting', 'Use OSI or TCP/IP layers to isolate where communication breaks.', [['Layer 1', 'Physical', 'Cable, signal, power'], ['Layer 2', 'Data link', 'MAC, VLAN, switching'], ['Layer 3', 'Network', 'IP, routing, gateway'], ['Layer 7', 'Application', 'Service, DNS name, app config']], 'Bottom-up troubleshooting is useful when the physical path is uncertain.', { question: 'If link lights are off, which layer should be checked first?', options: ['Layer 1', 'Layer 3', 'Layer 4', 'Layer 7'], correct: 0, explanation: 'No link light points to physical layer issues first.' }),
    ],
    quiz: [
      { id: 'diagnosis-q1', question: 'What is the first step in a standard troubleshooting methodology?', options: ['Identify the problem', 'Replace hardware', 'Document after guessing', 'Escalate immediately'], correct: 0, explanation: 'The process begins by identifying the problem and gathering information.' },
      { id: 'diagnosis-q2', question: 'Which OSI layer should be checked for VLAN mismatch?', options: ['Layer 1', 'Layer 2', 'Layer 4', 'Layer 7'], correct: 1, explanation: 'VLANs are Layer 2 segmentation.' },
      { id: 'diagnosis-q3', question: 'Why document the final fix?', options: ['For future troubleshooting and knowledge reuse', 'To erase logs', 'To skip validation', 'To bypass change control'], correct: 0, explanation: 'Documentation helps future support and confirms what changed.' },
    ],
    pbq: makeMatchPBQ('pbq-diagnosis-1', 'Match Troubleshooting Steps', 'Match each step to the right action.', [{ id: 'identify', label: 'Identify problem' }, { id: 'theory', label: 'Establish theory' }, { id: 'test', label: 'Test theory' }, { id: 'document', label: 'Document' }], [{ id: 'symptoms', label: 'Gather symptoms' }, { id: 'cause', label: 'Likely cause' }, { id: 'confirm', label: 'Confirm or reject' }, { id: 'record', label: 'Record findings' }], { identify: 'symptoms', theory: 'cause', test: 'confirm', document: 'record' }),
  }),
  escalation: makeTopic({
    id: 'escalation',
    name: 'Escalation & Change',
    icon: '📋',
    color: '#f59e0b',
    lessons: [
      makeLesson('escalation-1', 'Escalation Paths', 'Escalation moves issues to the right team when scope, permission, or expertise requires it.', [['Functional escalation', 'Specialist team', 'Need expertise'], ['Hierarchical escalation', 'Management chain', 'Need authority'], ['SLA', 'Response target', 'Priority handling'], ['Ticket notes', 'Work history', 'Prevent repeated work']], 'Escalate with evidence: symptoms, tests, timestamps, and impact.', { question: 'What escalation type sends work to a specialist team?', options: ['Functional escalation', 'Hierarchical escalation', 'Broadcast escalation', 'Native escalation'], correct: 0, explanation: 'Functional escalation routes the issue to a group with the required technical expertise.' }),
      makeLesson('escalation-2', 'Change Control', 'Change control reduces outages by reviewing, approving, testing, and documenting modifications.', [['Change request', 'Proposed modification', 'Risk and reason'], ['Rollback plan', 'How to undo', 'Recovery path'], ['Maintenance window', 'Approved time', 'Minimize impact'], ['Post-change validation', 'Confirm success', 'Test service']], 'Never make a risky production change without a rollback plan.', { question: 'What plan explains how to undo a failed change?', options: ['Rollback plan', 'Default route', 'NAT pool', 'SSID profile'], correct: 0, explanation: 'A rollback plan documents how to return to the previous working state.' }),
    ],
    quiz: [
      { id: 'escalation-q1', question: 'Which document tracks symptoms, tests, and work performed?', options: ['Ticket notes', 'ARP cache', 'MAC table', 'Certificate'], correct: 0, explanation: 'Ticket notes preserve troubleshooting history and handoff details.' },
      { id: 'escalation-q2', question: 'What should be included before a risky production change?', options: ['Rollback plan', 'Disabled logging', 'Random timing', 'Unapproved access'], correct: 0, explanation: 'A rollback plan is required so the change can be reversed if needed.' },
      { id: 'escalation-q3', question: 'What does an SLA define?', options: ['Service response targets', 'VLAN tag format', 'Cable color', 'Private key length only'], correct: 0, explanation: 'An SLA defines service expectations such as response or restoration targets.' },
    ],
    pbq: makeMatchPBQ('pbq-escalation-1', 'Match Process Terms', 'Match each operations term to its purpose.', [{ id: 'functional', label: 'Functional escalation' }, { id: 'sla', label: 'SLA' }, { id: 'rollback', label: 'Rollback plan' }, { id: 'window', label: 'Maintenance window' }], [{ id: 'specialist', label: 'Specialist team' }, { id: 'target', label: 'Response target' }, { id: 'undo', label: 'Undo failed change' }, { id: 'time', label: 'Approved change time' }], { functional: 'specialist', sla: 'target', rollback: 'undo', window: 'time' }),
  }),
};

export const DOMAIN_TOPICS = {
  1: expandTopics(DOMAIN1_TOPICS),
  2: expandTopics(DOMAIN2_TOPICS),
  3: expandTopics(DOMAIN3_TOPICS),
  4: expandTopics(DOMAIN4_TOPICS),
  5: expandTopics(DOMAIN5_TOPICS),
};

export const DOMAIN_TOPIC_ORDER = {
  1: DOMAIN1_TOPIC_ORDER,
  2: ['vlans', 'routing', 'switching', 'wireless'],
  3: ['monitoring', 'logs', 'snmp', 'backups'],
  4: ['firewalls', 'encryption', 'vpns', 'accesscontrol'],
  5: ['commonissues', 'tools', 'diagnosis', 'escalation'],
};

export const DOMAIN_TOPIC_IDS = DOMAIN_TOPIC_ORDER;

export const TOPIC_LABELS = Object.values(DOMAIN_TOPICS).reduce((labels, topics) => {
  Object.values(topics).forEach(topic => {
    labels[topic.id] = `${topic.icon} ${topic.name}`;
  });
  return labels;
}, {});

export function getDomainTopics(domainId) {
  const topics = DOMAIN_TOPICS[domainId] || {};
  return (DOMAIN_TOPIC_ORDER[domainId] || []).map(id => topics[id]).filter(Boolean);
}

export function getTopic(domainId, topicId) {
  return DOMAIN_TOPICS[domainId]?.[topicId] || DOMAIN1_TOPICS[topicId] || null;
}
