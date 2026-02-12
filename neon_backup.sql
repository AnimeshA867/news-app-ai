--
-- PostgreSQL database dump
--

\restrict 4d8Mq0MVP3pBJ0YYjUJKa4LURwVWFHR8DENCOsYhe7HXh1Xm1g6gMrmDaJOk1ef

-- Dumped from database version 17.7 (bdd1736)
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'EDITOR',
    'OWNER'
);


ALTER TYPE public."Role" OWNER TO postgres;

--
-- Name: Status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."Status" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'SCHEDULED'
);


ALTER TYPE public."Status" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AdPagePlacement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AdPagePlacement" (
    id text NOT NULL,
    "pageType" text NOT NULL,
    "pageIdentifier" text,
    "advertisementId" text NOT NULL
);


ALTER TABLE public."AdPagePlacement" OWNER TO postgres;

--
-- Name: Advertisement; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Advertisement" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "imageUrl" text,
    "linkUrl" text,
    width integer DEFAULT 300 NOT NULL,
    height integer DEFAULT 250 NOT NULL,
    "position" text NOT NULL,
    "startDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endDate" timestamp(3) without time zone,
    "isActive" boolean DEFAULT true NOT NULL,
    impressions integer DEFAULT 0 NOT NULL,
    clicks integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "adCode" text,
    priority integer DEFAULT 1 NOT NULL
);


ALTER TABLE public."Advertisement" OWNER TO postgres;

--
-- Name: Article; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Article" (
    id text NOT NULL,
    title text NOT NULL,
    slug text NOT NULL,
    excerpt text,
    content text NOT NULL,
    status public."Status" DEFAULT 'DRAFT'::public."Status" NOT NULL,
    "featuredImage" text,
    "readTime" integer,
    "viewCount" integer DEFAULT 0 NOT NULL,
    "publishedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "authorId" text NOT NULL,
    "categoryId" text NOT NULL,
    "featuredImageAlt" text,
    "metaTitle" text,
    "metaDescription" text,
    "metaKeywords" text,
    "canonicalUrl" text,
    "noIndex" boolean DEFAULT false NOT NULL,
    "structuredData" text,
    "jsonLd" jsonb
);


ALTER TABLE public."Article" OWNER TO postgres;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Category" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Category" OWNER TO postgres;

--
-- Name: Contact; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Contact" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    subject text NOT NULL,
    reason text NOT NULL,
    message text NOT NULL,
    status text DEFAULT 'NEW'::text NOT NULL,
    "isResolved" boolean DEFAULT false NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Contact" OWNER TO postgres;

--
-- Name: Media; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Media" (
    id text NOT NULL,
    name text NOT NULL,
    url text NOT NULL,
    type text NOT NULL,
    size integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Media" OWNER TO postgres;

--
-- Name: NavigationLink; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."NavigationLink" (
    id text NOT NULL,
    name text NOT NULL,
    href text NOT NULL,
    "group" text NOT NULL,
    "order" integer NOT NULL,
    "isEnabled" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."NavigationLink" OWNER TO postgres;

--
-- Name: Newsletter; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Newsletter" (
    id text NOT NULL,
    subject text NOT NULL,
    content text NOT NULL,
    "sentAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "sentTo" integer NOT NULL,
    opens integer DEFAULT 0 NOT NULL,
    clicks integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Newsletter" OWNER TO postgres;

--
-- Name: Page; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Page" (
    id text NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    "metaTitle" text,
    "metaDesc" text,
    "isPublished" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Page" OWNER TO postgres;

--
-- Name: Session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Session" (
    id text NOT NULL,
    "sessionId" text NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    expires timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Session" OWNER TO postgres;

--
-- Name: Setting; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Setting" (
    id text NOT NULL,
    "siteName" text NOT NULL,
    tagline text,
    description text,
    "logoUrl" text,
    "faviconUrl" text,
    "siteUrl" text,
    "socialImageUrl" text,
    "twitterImageUrl" text,
    "facebookImageUrl" text,
    "instagramLink" text,
    "facebookLink" text,
    "linkedinLink" text,
    "youtubeLink" text,
    "twitterLink" text,
    "senderEmail" text,
    "senderName" text,
    "smtpHost" text,
    "smtpPort" text,
    "smtpUsername" text,
    "smtpPassword" text,
    "enableNewsletter" boolean DEFAULT true NOT NULL,
    "enableSearch" boolean DEFAULT true NOT NULL,
    "enableSocialSharing" boolean DEFAULT true NOT NULL,
    "enableRelatedArticles" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."Setting" OWNER TO postgres;

--
-- Name: Subscriber; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Subscriber" (
    id text NOT NULL,
    email text NOT NULL,
    name text,
    verified boolean DEFAULT false NOT NULL,
    "verifyToken" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    preferences jsonb
);


ALTER TABLE public."Subscriber" OWNER TO postgres;

--
-- Name: Tag; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Tag" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Tag" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text,
    email text NOT NULL,
    "emailVerified" timestamp(3) without time zone,
    image text,
    password text,
    bio text,
    role public."Role" DEFAULT 'EDITOR'::public."Role" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _ArticleToTag; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."_ArticleToTag" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_ArticleToTag" OWNER TO postgres;

--
-- Data for Name: AdPagePlacement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."AdPagePlacement" (id, "pageType", "pageIdentifier", "advertisementId") FROM stdin;
\.


--
-- Data for Name: Advertisement; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Advertisement" (id, name, description, "imageUrl", "linkUrl", width, height, "position", "startDate", "endDate", "isActive", impressions, clicks, "createdAt", "updatedAt", "adCode", priority) FROM stdin;
\.


--
-- Data for Name: Article; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Article" (id, title, slug, excerpt, content, status, "featuredImage", "readTime", "viewCount", "publishedAt", "createdAt", "updatedAt", "authorId", "categoryId", "featuredImageAlt", "metaTitle", "metaDescription", "metaKeywords", "canonicalUrl", "noIndex", "structuredData", "jsonLd") FROM stdin;
cmagg7rhq000f0v1yg9ekcvq5	Major Policy Shift Announced by Government on Climate Change	major-policy-shift-climate-change	New environmental regulations set ambitious targets for carbon reduction over the next decade, impacting industries nationwide.	<h2>Government Announces New Climate Policy</h2>\n        <p>In a significant move that signals a major shift in environmental policy, the government today announced sweeping new regulations aimed at combating climate change. The new framework sets ambitious targets for carbon reduction across all sectors of the economy.</p>\n        <p>Industry leaders have expressed mixed reactions to the announcement, with some praising the bold action while others raise concerns about implementation costs and timelines.</p>\n        <h2>Key Points of the New Policy</h2>\n        <ul>\n          <li>50% reduction in carbon emissions by 2030</li>\n          <li>Mandatory renewable energy adoption for large corporations</li>\n          <li>New tax incentives for green technology development</li>\n          <li>Phased elimination of single-use plastics</li>\n        </ul>\n        <p>Environmental groups have largely welcomed the announcement, though some activists argue the measures don't go far enough to address the urgency of the climate crisis.</p>	PUBLISHED	https://utfs.io/f/ufeKv9dfaA3gq9g5OwJ1fZhioD3RuBL4ve6FWIgwlkVztOPH	8	22244	2025-05-09 07:02:08.364	2025-05-09 07:02:08.366	2026-02-11 19:41:46.554	cmagg7qss000d0v1yee34m5j3	cmagg7id500010v1yqv7m3m0p	\N	\N	\N	\N	\N	f	{}	{}
cmagg7s8w000h0v1yirs5b5kt	Tech Giant Unveils Revolutionary AI System That Can Predict Market Trends	tech-giant-ai-system-market-trends	New artificial intelligence platform claims to forecast economic shifts with unprecedented accuracy.	<h2>Revolutionary AI System Unveiled</h2>\n        <p>In a packed conference hall in Silicon Valley, one of the world's leading tech companies unveiled what they claim is a breakthrough in artificial intelligence technology. The new system, called "EconoPredict," reportedly can analyze vast amounts of global economic data to predict market trends with accuracy levels previously thought impossible.</p>\n        <p>The AI system uses a combination of machine learning algorithms, natural language processing of news and social media, and analysis of historical economic patterns to generate its forecasts.</p>\n        <h2>Potential Impact on Financial Markets</h2>\n        <p>Financial experts are divided on the implications of such technology. Some see it as a game-changer that could democratize market intelligence, while others express concern about the potential for market manipulation or unfair advantages.</p>\n        <p>"If this technology works as advertised, it could fundamentally change how investment decisions are made," said Dr. Elena Rodriguez, an economist at Capital University. "But there are serious questions about transparency and access that need to be addressed."</p>	PUBLISHED	https://utfs.io/f/ufeKv9dfaA3giixqV95XeUT8GLnd24hZsMDcCl301oWYIpgy	6	22211	2025-05-09 07:02:09.343	2025-05-09 07:02:09.344	2026-02-11 19:22:24.573	cmagg7qss000d0v1yee34m5j3	cmagg7jgk00040v1ykfk2v9bc	\N	\N	\N	\N	\N	f	{\n  "@context": "https://schema.org",\n  "@type": "NewsArticle",\n  "headline": "Tech Giant Unveils Revolutionary AI System That Can Predict Market Trends",\n  "description": "New artificial intelligence platform claims to forecast economic shifts with unprecedented accuracy.",\n  "image": [\n    "https://placehold.co/600x400?text=Image+Placeholder"\n  ],\n  "datePublished": "2025-05-20T16:26:48.262Z",\n  "dateModified": "2025-05-20T16:26:48.262Z",\n  "author": {\n    "@type": "Person",\n    "name": "Editor"\n  },\n  "publisher": {\n    "@type": "Organization",\n    "name": "NewsHub",\n    "logo": {\n      "@type": "ImageObject",\n      "url": "/logo.png"\n    }\n  },\n  "mainEntityOfPage": {\n    "@type": "WebPage",\n    "@id": "https://yourdomain.com/article/tech-giant-ai-system-market-trends"\n  }\n}	{"@type": "NewsArticle", "image": ["https://placehold.co/600x400?text=Image+Placeholder"], "author": {"name": "Editor", "@type": "Person"}, "@context": "https://schema.org", "headline": "Tech Giant Unveils Revolutionary AI System That Can Predict Market Trends", "publisher": {"logo": {"url": "/logo.png", "@type": "ImageObject"}, "name": "NewsHub", "@type": "Organization"}, "description": "New artificial intelligence platform claims to forecast economic shifts with unprecedented accuracy.", "dateModified": "2025-05-20T16:26:48.262Z", "datePublished": "2025-05-20T16:26:48.262Z", "mainEntityOfPage": {"@id": "https://yourdomain.com/article/tech-giant-ai-system-market-trends", "@type": "WebPage"}}
\.


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Category" (id, name, slug, description, "createdAt", "updatedAt") FROM stdin;
cmagg7id500010v1yqv7m3m0p	Politics	politics	Latest political news and updates	2025-05-09 07:01:56.538	2025-05-09 07:01:56.538
cmagg7j5k00030v1ydie72fmq	Business	business	Business news and economic updates	2025-05-09 07:01:57.561	2025-05-09 07:01:57.561
cmagg7jgk00040v1ykfk2v9bc	Technology	technology	Tech news and digital trends	2025-05-09 07:01:57.956	2025-05-09 07:01:57.956
cmagg7jr800050v1yojom5qxz	Entertainment	entertainment	Entertainment and celebrity news	2025-05-09 07:01:58.34	2025-05-09 07:01:58.34
cmagg7k2x00060v1yfyrwloc1	Sports	sports	Sports news and coverage	2025-05-09 07:01:58.761	2025-05-09 07:01:58.761
cmagg7kdl00070v1yt7okmhzp	Health	health	Health news and wellness information	2025-05-09 07:01:59.145	2025-05-09 07:01:59.145
\.


--
-- Data for Name: Contact; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Contact" (id, name, email, subject, reason, message, status, "isResolved", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Media; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Media" (id, name, url, type, size, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: NavigationLink; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."NavigationLink" (id, name, href, "group", "order", "isEnabled", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Newsletter; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Newsletter" (id, subject, content, "sentAt", "sentTo", opens, clicks, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Page; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Page" (id, slug, title, content, "metaTitle", "metaDesc", "isPublished", "createdAt", "updatedAt") FROM stdin;
cmagg7sxv000i0v1yckoait44	about	About Us	\n      <h1>About Us</h1>\n      <p>Welcome to our news platform. We are dedicated to delivering accurate, timely, and relevant news to our audience.</p>\n      <h2>Our Mission</h2>\n      <p>Our mission is to provide our readers with the most accurate, unbiased reporting possible. We believe in the power of journalism to inform, educate, and inspire.</p>\n      <h2>Our Team</h2>\n      <p>Our team consists of experienced journalists, editors, and content creators who are passionate about delivering quality news content.</p>\n    	\N	\N	t	2025-05-09 07:02:10.244	2025-05-09 07:02:10.244
cmagg7t4r000j0v1y65rn4uxe	contact	Contact Us	\n      <h1>Contact Us</h1>\n      <p>We'd love to hear from you! Whether you have a news tip, feedback, or just want to say hello, there are several ways to get in touch with us.</p>\n      <h2>Email</h2>\n      <p>General inquiries: <a href="mailto:info@example.com">info@example.com</a></p>\n      <p>News tips: <a href="mailto:news@example.com">news@example.com</a></p>\n      <h2>Address</h2>\n      <p>123 News Street<br>Cityville, State 12345<br>United States</p>\n      <h2>Phone</h2>\n      <p>(123) 456-7890</p>\n    	\N	\N	t	2025-05-09 07:02:10.492	2025-05-09 07:02:10.492
cmagg7tbm000k0v1yrl2jxn57	careers	Careers	\n      <h1>Join Our Team</h1>\n      <p>We're always looking for talented individuals to join our team. Check out our current openings below.</p>\n      <h2>Current Openings</h2>\n      <ul>\n        <li>Senior Editor</li>\n        <li>News Reporter</li>\n        <li>Content Writer</li>\n        <li>Web Developer</li>\n      </ul>\n      <p>To apply, please send your resume and cover letter to <a href="mailto:careers@example.com">careers@example.com</a>.</p>\n    	\N	\N	t	2025-05-09 07:02:10.738	2025-05-09 07:02:10.738
cmagg7tg7000l0v1yf97etjk1	advertise	Advertise With Us	\n      <h1>Advertise With Us</h1>\n      <p>Reach our engaged audience through strategic advertising partnerships.</p>\n      <h2>Why Advertise With Us</h2>\n      <ul>\n        <li>Targeted audience of engaged readers</li>\n        <li>Multiple ad formats and placements</li>\n        <li>Custom campaign options</li>\n        <li>Detailed analytics and reporting</li>\n      </ul>\n      <p>For advertising inquiries, please contact <a href="mailto:ads@example.com">ads@example.com</a>.</p>\n    	\N	\N	t	2025-05-09 07:02:10.904	2025-05-09 07:02:10.904
cmagg7tl0000m0v1y5k1y89sd	ethics-policy	Ethics Policy	\n      <h1>Ethics Policy</h1>\n      <p>This ethics policy outlines the principles and standards that guide our journalism.</p>\n      <h2>Editorial Independence</h2>\n      <p>We maintain a strict separation between news coverage and advertising. Our editorial decisions are made independently of commercial or political interests.</p>\n      <h2>Accuracy and Fact-Checking</h2>\n      <p>We are committed to factual accuracy in our reporting. All articles undergo thorough fact-checking before publication.</p>\n      <h2>Corrections and Updates</h2>\n      <p>We promptly correct errors and provide updates when necessary to ensure our coverage remains accurate.</p>\n    	\N	\N	t	2025-05-09 07:02:11.076	2025-05-09 07:02:11.076
cmagg7tpk000n0v1yx4mxlj9m	terms	Terms of Use	\n      <h1>Terms of Use</h1>\n      <p>By accessing and using this website, you agree to be bound by these Terms of Use.</p>\n      <h2>Content Usage</h2>\n      <p>All content on this website is protected by copyright. You may not reproduce, distribute, or modify any content without our express permission.</p>\n      <h2>User Accounts</h2>\n      <p>If you create an account, you are responsible for maintaining the security of your account and for all activities that occur under your account.</p>\n      <h2>Limitation of Liability</h2>\n      <p>We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.</p>\n    	\N	\N	t	2025-05-09 07:02:11.241	2025-05-09 07:02:11.241
cmagg7tu8000o0v1y658qahc9	privacy	Privacy Policy	\n      <h1>Privacy Policy</h1>\n      <p>This Privacy Policy explains how we collect, use, and protect your personal information.</p>\n      <h2>Information Collection</h2>\n      <p>We collect information you provide directly to us when you create an account, subscribe to our newsletter, or contact us.</p>\n      <h2>How We Use Your Information</h2>\n      <p>We use your information to provide and improve our services, communicate with you, and personalize your experience.</p>\n      <h2>Information Sharing</h2>\n      <p>We do not sell or rent your personal information to third parties. We may share your information with service providers who assist us in operating our website.</p>\n    	\N	\N	t	2025-05-09 07:02:11.409	2025-05-09 07:02:11.409
cmagg7tys000p0v1yu69s1nzz	cookie-policy	Cookie Policy	\n      <h1>Cookie Policy</h1>\n      <p>This Cookie Policy explains how we use cookies and similar technologies on our website.</p>\n      <h2>What Are Cookies</h2>\n      <p>Cookies are small text files that are stored on your device when you visit our website.</p>\n      <h2>How We Use Cookies</h2>\n      <p>We use cookies to remember your preferences, analyze website traffic, and personalize content.</p>\n      <h2>Managing Cookies</h2>\n      <p>You can control and delete cookies through your browser settings. However, if you disable cookies, some features of our website may not function properly.</p>\n    	\N	\N	t	2025-05-09 07:02:11.572	2025-05-09 07:02:11.572
cmagg7u3n000q0v1yhyrkashy	accessibility	Accessibility	\n      <h1>Accessibility Statement</h1>\n      <p>We are committed to making our website accessible to everyone, including people with disabilities.</p>\n      <h2>Accessibility Standards</h2>\n      <p>We strive to comply with the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA.</p>\n      <h2>Assistive Technologies</h2>\n      <p>Our website is designed to be compatible with various assistive technologies, including screen readers and voice recognition software.</p>\n      <h2>Feedback</h2>\n      <p>If you encounter any accessibility issues on our website, please contact us at <a href="mailto:accessibility@example.com">accessibility@example.com</a>.</p>\n    	\N	\N	t	2025-05-09 07:02:11.747	2025-05-09 07:02:11.747
\.


--
-- Data for Name: Session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Session" (id, "sessionId", "userId", "createdAt", "updatedAt", expires) FROM stdin;
\.


--
-- Data for Name: Setting; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Setting" (id, "siteName", tagline, description, "logoUrl", "faviconUrl", "siteUrl", "socialImageUrl", "twitterImageUrl", "facebookImageUrl", "instagramLink", "facebookLink", "linkedinLink", "youtubeLink", "twitterLink", "senderEmail", "senderName", "smtpHost", "smtpPort", "smtpUsername", "smtpPassword", "enableNewsletter", "enableSearch", "enableSocialSharing", "enableRelatedArticles") FROM stdin;
default	Manasukh news	AI-Powered News Platform	The latest news and stories from around the world	/logo.svg	/favicon.ico	https://news.manasukh.com	/socialImage	\N	\N	\N	\N	\N	\N	\N	news@example.com	News AI	live.smtp.mailtrap.io	587	animeshacharya31@gmail.com	xnjl iykl hvta kayw 	t	t	t	t
\.


--
-- Data for Name: Subscriber; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Subscriber" (id, email, name, verified, "verifyToken", "createdAt", "updatedAt", preferences) FROM stdin;
cmi08yoqz0000jp0a2q9h1v5s	ubesopix12@gmail.com	NysGhbpFIWpOcbkoirzFufG	t	\N	2025-11-15 12:12:27.467	2025-11-15 12:12:27.467	\N
cmi459t7y0000la0ad7z8g6c5	agerapijogoy99@gmail.com	zvgOtGvbWFjREYorvqBDOFSK	t	\N	2025-11-18 05:40:12.719	2025-11-18 05:40:12.719	\N
cmirpqdgf0000jr0a310w2jf1	larupayi18@gmail.com	jsKxPyZPcBJlVQuuE	t	\N	2025-12-04 17:31:39.807	2025-12-04 17:31:39.807	\N
cmjz027to0000l50atb1uqgfa	pasozut738@gmail.com	CNPVChSeGYWwFxnqcPC	t	\N	2026-01-04 00:34:54.109	2026-01-04 00:34:54.109	\N
\.


--
-- Data for Name: Tag; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Tag" (id, name, slug, "createdAt", "updatedAt") FROM stdin;
cmagg7kob00080v1ybhx7m4ow	Breaking News	breaking-news	2025-05-09 07:01:59.531	2025-05-09 07:01:59.531
cmagg7pd000090v1y39b38qe1	Analysis	analysis	2025-05-09 07:02:05.605	2025-05-09 07:02:05.605
cmagg7poc000a0v1yhotmqyc2	Opinion	opinion	2025-05-09 07:02:06.013	2025-05-09 07:02:06.013
cmagg7q04000b0v1yh635v5gj	Feature	feature	2025-05-09 07:02:06.437	2025-05-09 07:02:06.437
cmagg7qbi000c0v1yl6rvewbo	Interview	interview	2025-05-09 07:02:06.846	2025-05-09 07:02:06.846
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, name, email, "emailVerified", image, password, bio, role, "createdAt", "updatedAt") FROM stdin;
cmagg7hlh00000v1yb0bmgz41	Site Owner	owner@example.com	\N	\N	$2b$10$3LsNuygYtq17VpsnglXegOXbqmzuXv2CQexsaTBKMLlB3Q8BeI/jm	\N	OWNER	2025-05-09 07:01:55.541	2025-05-09 07:01:55.541
cmagg7qss000d0v1yee34m5j3	Animesh Acharya	animeshacharya867@gmail.com	\N	\N	$2b$10$gneSpRuJqRqghk.W2G0bu.UbqaL5Q/bu.fzBSnXhgpVGQh1aHJFz.	\N	ADMIN	2025-05-09 07:02:07.468	2025-05-09 07:02:07.468
\.


--
-- Data for Name: _ArticleToTag; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."_ArticleToTag" ("A", "B") FROM stdin;
cmagg7s8w000h0v1yirs5b5kt	cmagg7kob00080v1ybhx7m4ow
cmagg7s8w000h0v1yirs5b5kt	cmagg7q04000b0v1yh635v5gj
cmagg7rhq000f0v1yg9ekcvq5	cmagg7kob00080v1ybhx7m4ow
cmagg7rhq000f0v1yg9ekcvq5	cmagg7pd000090v1y39b38qe1
cmagg7rhq000f0v1yg9ekcvq5	cmagg7q04000b0v1yh635v5gj
\.


--
-- Name: AdPagePlacement AdPagePlacement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AdPagePlacement"
    ADD CONSTRAINT "AdPagePlacement_pkey" PRIMARY KEY (id);


--
-- Name: Advertisement Advertisement_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Advertisement"
    ADD CONSTRAINT "Advertisement_pkey" PRIMARY KEY (id);


--
-- Name: Article Article_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Article"
    ADD CONSTRAINT "Article_pkey" PRIMARY KEY (id);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Contact Contact_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Contact"
    ADD CONSTRAINT "Contact_pkey" PRIMARY KEY (id);


--
-- Name: Media Media_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Media"
    ADD CONSTRAINT "Media_pkey" PRIMARY KEY (id);


--
-- Name: NavigationLink NavigationLink_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."NavigationLink"
    ADD CONSTRAINT "NavigationLink_pkey" PRIMARY KEY (id);


--
-- Name: Newsletter Newsletter_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Newsletter"
    ADD CONSTRAINT "Newsletter_pkey" PRIMARY KEY (id);


--
-- Name: Page Page_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Page"
    ADD CONSTRAINT "Page_pkey" PRIMARY KEY (id);


--
-- Name: Session Session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Session"
    ADD CONSTRAINT "Session_pkey" PRIMARY KEY (id);


--
-- Name: Setting Setting_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Setting"
    ADD CONSTRAINT "Setting_pkey" PRIMARY KEY (id);


--
-- Name: Subscriber Subscriber_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Subscriber"
    ADD CONSTRAINT "Subscriber_pkey" PRIMARY KEY (id);


--
-- Name: Tag Tag_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Tag"
    ADD CONSTRAINT "Tag_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _ArticleToTag _ArticleToTag_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."_ArticleToTag"
    ADD CONSTRAINT "_ArticleToTag_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: AdPagePlacement_pageType_pageIdentifier_advertisementId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "AdPagePlacement_pageType_pageIdentifier_advertisementId_key" ON public."AdPagePlacement" USING btree ("pageType", "pageIdentifier", "advertisementId");


--
-- Name: Article_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Article_slug_key" ON public."Article" USING btree (slug);


--
-- Name: Category_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Category_name_key" ON public."Category" USING btree (name);


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: Page_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Page_slug_key" ON public."Page" USING btree (slug);


--
-- Name: Session_sessionId_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Session_sessionId_key" ON public."Session" USING btree ("sessionId");


--
-- Name: Subscriber_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Subscriber_email_key" ON public."Subscriber" USING btree (email);


--
-- Name: Tag_name_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Tag_name_key" ON public."Tag" USING btree (name);


--
-- Name: Tag_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Tag_slug_key" ON public."Tag" USING btree (slug);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: _ArticleToTag_B_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "_ArticleToTag_B_index" ON public."_ArticleToTag" USING btree ("B");


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

\unrestrict 4d8Mq0MVP3pBJ0YYjUJKa4LURwVWFHR8DENCOsYhe7HXh1Xm1g6gMrmDaJOk1ef

