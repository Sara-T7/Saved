-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 05, 2026 at 09:45 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `collab_editor`
--

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `document_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `content` text NOT NULL,
  `resolved` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `document_id`, `user_id`, `content`, `resolved`, `created_at`) VALUES
(1, 5, 4, 'jkjkjkkji', 0, '2026-08-05 07:43:58');

-- --------------------------------------------------------

--
-- Table structure for table `comment_replies`
--

CREATE TABLE `comment_replies` (
  `id` int(11) NOT NULL,
  `comment_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` longtext DEFAULT NULL,
  `owner_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `title`, `content`, `owner_id`, `created_at`, `updated_at`) VALUES
(1, 'My First Document', '', 1, '2026-08-02 11:05:11', '2026-08-02 11:05:11'),
(2, 'conversation', '<p><code>Document version </code>usually refers to a <strong>version <u>number</u></strong><u> </u>of a document. It is used to keep track of changes made to a document over time.</p><p>In a <s>collaborative </s>editor multiple users may edit the same document simultaneously. A version number helps the system know whether the document has changed and can be used to prevent conflicts.</p>', 2, '2026-08-02 11:39:05', '2026-08-04 13:27:49'),
(3, 'conversation2', '<p>this is conversation 2...<br><br><strong><u>thankyou</u></strong></p><p></p>', 2, '2026-08-02 11:39:23', '2026-08-04 12:03:34'),
(4, 'Project Proposal', '<p></p>', 3, '2026-08-02 18:12:18', '2026-08-02 18:12:22'),
(5, 'Chats', '<h2>hi<br><strong>hi!</strong>..</h2><p></p>', 2, '2026-08-02 19:36:13', '2026-08-05 07:43:50'),
(6, 'Document2', '<p>HELLO</p><p></p>', 4, '2026-08-02 19:55:00', '2026-08-04 13:07:15'),
(7, 'Test Document', '<h1><strong><em><u>Hello World! This is a collaborative editor.</u></em></strong></h1><p></p>', 5, '2026-08-03 19:27:59', '2026-08-03 19:44:02'),
(8, 'Document-1', '<p>hello<br>this is document one..</p><p></p>', 4, '2026-08-04 08:07:25', '2026-08-04 13:06:36'),
(9, 'doc1', '<p></p>', 8, '2026-08-04 10:36:58', '2026-08-04 12:41:29'),
(11, 'Document2 (Copy)', '<p>HELLO</p><p></p>', 4, '2026-08-04 13:11:01', '2026-08-04 13:11:03'),
(12, 'doc1', '<p><strong>sdkdmfd</strong>/;/g. ee</p>', 4, '2026-08-04 13:25:33', '2026-08-05 07:45:11'),
(13, 'doc1 (Copy)', '<p><strong>sdkdmfd</strong>/;/g.</p>', 4, '2026-08-04 13:27:01', '2026-08-04 13:27:59');

-- --------------------------------------------------------

--
-- Table structure for table `document_permissions`
--

CREATE TABLE `document_permissions` (
  `id` int(11) NOT NULL,
  `document_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `permission` enum('viewer','commenter','editor') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `document_shares`
--

CREATE TABLE `document_shares` (
  `id` int(11) NOT NULL,
  `document_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `permission` enum('viewer','commenter','editor') DEFAULT 'viewer',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `document_shares`
--

INSERT INTO `document_shares` (`id`, `document_id`, `user_id`, `permission`, `created_at`) VALUES
(1, 6, 2, 'commenter', '2026-08-02 19:55:45'),
(2, 5, 4, 'commenter', '2026-08-02 20:10:41'),
(3, 8, 2, 'editor', '2026-08-04 08:07:43'),
(5, 6, 8, 'editor', '2026-08-04 09:11:24'),
(6, 9, 4, 'commenter', '2026-08-04 10:38:24'),
(7, 9, 2, 'editor', '2026-08-04 10:38:42'),
(8, 12, 2, 'viewer', '2026-08-04 13:26:45');

-- --------------------------------------------------------

--
-- Table structure for table `document_versions`
--

CREATE TABLE `document_versions` (
  `id` int(11) NOT NULL,
  `document_id` int(11) NOT NULL,
  `content` longtext NOT NULL DEFAULT '',
  `version_number` int(11) NOT NULL DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `document_versions`
--

INSERT INTO `document_versions` (`id`, `document_id`, `content`, `version_number`, `created_by`, `created_at`) VALUES
(1, 7, '<p></p>', 1, 5, '2026-08-03 19:28:06'),
(2, 7, '<p>Hello World! This is a collaborative editor.</p>', 2, 5, '2026-08-03 19:28:42'),
(3, 7, '<p><strong>Hello World! This is a collaborative editor.</strong></p>', 3, 5, '2026-08-03 19:29:05'),
(4, 7, '<p><strong><em>Hello World! This is a collaborative editor.</em></strong></p>', 4, 5, '2026-08-03 19:29:23'),
(5, 7, '<p><strong><em><u>Hello World! This is a collaborative editor.</u></em></strong></p>', 5, 5, '2026-08-03 19:29:28'),
(6, 7, '<h1><strong><em><u>Hello World! This is a collaborative editor.</u></em></strong></h1><p></p>', 6, 5, '2026-08-03 19:29:41'),
(7, 7, '<h1><strong><em><u>Hello World! This is a collaborative editor.</u></em></strong></h1><p></p>', 7, 5, '2026-08-03 19:44:02'),
(8, 6, '<h3>Hello!<br>hey <strong><u>everyone</u></strong>...</h3><p></p><p style=\"text-align: right;\"></p>', 1, 4, '2026-08-03 20:08:00'),
(9, 5, '<p></p>', 1, 4, '2026-08-03 20:08:48'),
(10, 5, '<p></p>', 2, 4, '2026-08-03 20:09:39'),
(11, 6, '<h3>Hello!<br>hey <strong><u>everyone</u></strong>...</h3><p></p><p style=\"text-align: right;\"></p>', 2, 2, '2026-08-03 20:10:09'),
(12, 6, '<h3>Hello!<br>hey <strong><u>everyone</u></strong>...</h3><p></p><p style=\"text-align: right;\"></p>', 3, 2, '2026-08-03 20:12:13'),
(13, 8, '<p></p>', 1, 4, '2026-08-04 08:07:27'),
(14, 8, '<p></p>', 2, 2, '2026-08-04 08:08:32'),
(15, 8, '<p><strong>React</strong> is used to build the <strong>frontend/user interface</strong>.</p>', 3, 2, '2026-08-04 08:09:07'),
(16, 8, '<p><strong>React</strong> is used to build the <strong>frontend/user interface</strong>.</p>', 4, 2, '2026-08-04 08:09:21'),
(17, 8, '<p><strong>React</strong> is used to build the <strong>frontend/user interface</strong>.</p>', 5, 2, '2026-08-04 08:09:36'),
(18, 8, '<p><strong>React</strong> is used to build the <strong>frontend/user interface</strong>.<br></p>', 6, 2, '2026-08-04 08:09:41'),
(19, 8, '<p><strong>React</strong> is used to build the <strong>frontend/user interface</strong>.<br><strong>Vite</strong> is the tool that creates and runs the React project quickly.</p>', 7, 2, '2026-08-04 08:09:59'),
(20, 8, '<p><strong>React</strong> is used to build the <strong>frontend/user interface</strong>.<br><strong>Vite</strong> is the tool that creates and runs the React project quickly.</p>', 8, 4, '2026-08-04 08:11:37'),
(21, 3, '<p></p>', 1, 2, '2026-08-04 08:12:42'),
(22, 8, '<p></p>', 9, 2, '2026-08-04 08:12:48'),
(23, 8, '<p></p>', 10, 4, '2026-08-04 08:12:56'),
(24, 8, '<p></p>', 11, 4, '2026-08-04 08:13:46'),
(25, 8, '<p>React lets you build these as reusable <strong>components</strong>.</p><p><strong>Vite</strong> is the tool that creates and runs the React project quickly.</p><p>Think:</p><blockquote><p><strong>React = how we build the UI</strong><br><strong>Vite = the fast tool that runs/builds the React project</strong></p></blockquote><p></p>', 12, 4, '2026-08-04 08:14:39'),
(26, 8, '<p>React lets you build these as reusable <strong>components.</strong></p><p><strong>Vite</strong> is the tool that creates and runs the React project quickly.</p><p>Think:</p><blockquote><p><strong>React = how we build the UI</strong><br><strong>Vite = the fast tool that runs/builds the React project</strong></p></blockquote><p></p>', 13, 4, '2026-08-04 08:14:47'),
(27, 8, '<p>React lets you build these as reusable <strong>components.</strong></p><p><strong>Vite</strong> is the tool that creates and runs the React project quickly.</p><p>Think:</p><blockquote><p><strong>React = how we build the UI</strong><br><strong>Vite = the fast tool that runs/builds the React project</strong></p></blockquote><p></p>', 14, 4, '2026-08-04 08:54:15'),
(28, 8, '<p>React lets you build these as reusable <strong>components.</strong></p><p><strong>Vite</strong> is the tool that creates and runs the React project quickly.</p><p>Think:</p><blockquote><p><strong>React = how we build the UI</strong><br><strong>Vite = the fast tool that runs/builds the React project</strong></p></blockquote><p></p>', 15, 2, '2026-08-04 08:54:28'),
(29, 8, '<p>React lets you build these as reusable <strong>components.</strong></p><p><strong>Vite</strong> is the tool that creates and runs the React project quickly.</p><p>Think:</p><blockquote><p><strong>React = how we build the UI</strong><br><strong>Vite = the fast tool that runs/builds the React project</strong></p><p></p></blockquote><p></p>', 16, 4, '2026-08-04 08:54:37'),
(30, 8, '<p>React lets you build these as reusable <strong>components.</strong></p><p><strong>Vite</strong> is the tool that creates and runs the React project quickly.</p><blockquote><p><strong>React = how we build the UI</strong><br><strong>Vite = the fast tool that runs/builds the React project</strong></p><p></p></blockquote><p></p>', 17, 4, '2026-08-04 08:54:59'),
(31, 8, '<p>React lets you build these as reusable <strong>components.</strong></p><p><strong>Vite</strong> is the tool that creates and runs the React project quickly.</p><blockquote><p><strong>React = how we build the UI</strong><br><strong>Vite = the fast tool that runs/builds the React project.</strong><br></p></blockquote><p></p>', 18, 4, '2026-08-04 08:55:06'),
(32, 6, '<h3>Hello!<br>hey <strong><u>everyone</u></strong>...</h3><p></p><p style=\"text-align: right;\"></p>', 4, 4, '2026-08-04 08:55:52'),
(33, 8, '<p></p>', 19, 2, '2026-08-04 08:56:52'),
(34, 6, '<p></p>', 5, 2, '2026-08-04 08:57:00'),
(35, 6, '<p></p>', 6, 4, '2026-08-04 08:57:35'),
(36, 6, '<p>....</p><p></p>', 7, 4, '2026-08-04 08:57:44'),
(37, 6, '<p>....</p><p></p>', 8, 4, '2026-08-04 09:08:40'),
(38, 6, '<p>....</p><p></p>', 9, 2, '2026-08-04 09:08:46'),
(39, 6, '<p>....</p><p>what is thr</p>', 10, 4, '2026-08-04 09:09:01'),
(40, 6, '<p>....</p><p>what is th</p>', 11, 4, '2026-08-04 09:09:05'),
(41, 6, '<p>....</p><p>what is th</p>', 12, 4, '2026-08-04 09:09:19'),
(42, 6, '<p>....</p><p>what is th</p>', 13, 4, '2026-08-04 09:11:10'),
(43, 6, '<p>....</p><p>what is th</p>', 14, 8, '2026-08-04 09:13:22'),
(44, 6, '<p>....</p><p>what is the</p>', 15, 8, '2026-08-04 09:13:27'),
(45, 6, '<p>....</p><p>what is the purpose of this chat2?</p>', 16, 4, '2026-08-04 09:14:23'),
(46, 6, '<p>....</p><p>what is the purpose of this chat2?</p>', 17, 8, '2026-08-04 09:14:51'),
(47, 6, '<p>....</p><p>what is the purpose of this chat2?</p>', 18, 4, '2026-08-04 09:15:09'),
(48, 6, '<p>....</p><p>what is the purpose of this chat2?</p>', 19, 4, '2026-08-04 10:30:14'),
(49, 6, '<p>....</p><p>what is the purpose of this chat2?</p>', 20, 4, '2026-08-04 10:35:21'),
(50, 9, '<p></p>', 1, 8, '2026-08-04 10:37:00'),
(51, 9, '<p>A website isn\'t just \"a page.\" It\'s usually a conversation between a <strong>browser, server, and sometimes a database</strong>. 🌐</p>', 2, 8, '2026-08-04 10:38:11'),
(52, 9, '<p>A website isn\'t just \"a page.\" It\'s usually a conversation between a <strong>browser, server, and sometimes a database</strong>. 🌐</p>', 3, 8, '2026-08-04 10:38:54'),
(53, 9, '<p>A website isn\'t just \"a page.\" It\'s usually a conversation between a <strong>browser, server, and sometimes a database</strong>. 🌐</p>', 4, 4, '2026-08-04 10:39:35'),
(54, 6, '<p></p>', 21, 8, '2026-08-04 10:41:27'),
(55, 6, '<p></p>', 22, 8, '2026-08-04 10:41:32'),
(56, 9, '<p>A website isn\'t just \"a page.\" It\'s usually a conversation between a <strong>browser, server, and sometimes a database</strong>. 🌐</p>', 5, 8, '2026-08-04 10:41:38'),
(57, 9, '<p>A website isn\'t just \"a page.\" It\'s usually a conversation between a <strong>browser, server, and sometimes a database</strong>. 🌐</p>', 6, 8, '2026-08-04 10:41:50'),
(58, 6, '<p></p>', 23, 8, '2026-08-04 10:42:21'),
(59, 6, '<p>sthing anythng everything...</p>', 24, 8, '2026-08-04 10:42:32'),
(60, 6, '<p>something anythng everything...</p>', 25, 8, '2026-08-04 10:42:35'),
(61, 6, '<p>something anythi</p><p>ng everything...</p>', 26, 8, '2026-08-04 10:42:41'),
(62, 6, '<p>something anything everything...</p>', 27, 8, '2026-08-04 10:42:44'),
(63, 6, '<p>something anything everything...</p>', 28, 8, '2026-08-04 10:43:15'),
(64, 6, '<p>something anything everything...</p>', 29, 4, '2026-08-04 10:43:31'),
(65, 6, '<p>something anything everything...</p>', 30, 4, '2026-08-04 10:45:04'),
(66, 6, '<p>something anything everything...</p>', 31, 8, '2026-08-04 10:45:11'),
(67, 6, '<p>something anything everything...</p>', 32, 8, '2026-08-04 10:45:15'),
(68, 9, '<p>A website isn\'t just \"a page.\" It\'s usually a conversation between a <strong>browser, server, and sometimes a database</strong>. 🌐</p>', 7, 8, '2026-08-04 10:53:16'),
(69, 9, '<p></p>', 8, 8, '2026-08-04 10:53:45'),
(70, 9, '<p></p>', 9, 8, '2026-08-04 10:54:57'),
(71, 9, '<p></p>', 10, 4, '2026-08-04 10:55:22'),
(72, 9, '<p></p>', 11, 4, '2026-08-04 10:57:30'),
(73, 9, '<p></p>', 12, 4, '2026-08-04 10:59:13'),
(74, 9, '<p></p>', 13, 2, '2026-08-04 11:01:37'),
(75, 6, '<p>something anything everything...</p>', 33, 4, '2026-08-04 11:01:47'),
(76, 6, '<p>something anything everything...</p>', 34, 4, '2026-08-04 11:01:54'),
(77, 6, '<p></p>', 35, 2, '2026-08-04 11:02:04'),
(78, 6, '<p></p>', 36, 2, '2026-08-04 11:44:33'),
(79, 6, '<p></p>', 37, 4, '2026-08-04 11:47:06'),
(80, 9, '<p></p>', 14, 4, '2026-08-04 12:01:31'),
(81, 5, '<p></p>', 3, 4, '2026-08-04 12:02:04'),
(82, 6, '<p></p>', 38, 4, '2026-08-04 12:02:15'),
(83, 6, '<p>HELLO</p><p></p>', 39, 4, '2026-08-04 12:02:20'),
(84, 8, '<p></p>', 20, 4, '2026-08-04 12:02:25'),
(85, 8, '<p>hello<br>this is document one...</p><p></p>', 21, 4, '2026-08-04 12:02:35'),
(86, 3, '<p></p>', 2, 2, '2026-08-04 12:03:02'),
(87, 3, '<p>this is conversation 1...</p><p></p>', 3, 2, '2026-08-04 12:03:11'),
(88, 3, '<p>this is conversation 1...</p><p></p>', 4, 2, '2026-08-04 12:03:16'),
(89, 3, '<p>this is conversation 2...</p><p></p>', 5, 2, '2026-08-04 12:03:21'),
(90, 3, '<p>this is conversation 2...<br><br>thankyou</p><p></p>', 6, 2, '2026-08-04 12:03:30'),
(91, 3, '<p>this is conversation 2...<br><br><strong><u>thankyou</u></strong></p><p></p>', 7, 2, '2026-08-04 12:03:34'),
(92, 5, '<p>can we chat</p>', 4, 2, '2026-08-04 12:03:46'),
(93, 5, '<p></p>', 5, 2, '2026-08-04 12:03:55'),
(94, 5, '<p>hi<br>hi</p>', 6, 2, '2026-08-04 12:04:05'),
(95, 5, '<p>hi<br>hi!..</p><p></p>', 7, 2, '2026-08-04 12:04:11'),
(96, 5, '<p>hi<br>hi!..</p><p></p>', 8, 2, '2026-08-04 12:04:19'),
(97, 5, '<h1>hi<br>hi!..</h1><p></p>', 9, 2, '2026-08-04 12:04:22'),
(98, 5, '<h2>hi<br>hi!..</h2><p></p>', 10, 2, '2026-08-04 12:04:29'),
(99, 5, '<h3>hi<br><strong>hi!</strong>..</h3><p></p>', 11, 2, '2026-08-04 12:04:36'),
(100, 5, '<h2>hi<br><strong>hi!</strong>..</h2><p></p>', 12, 2, '2026-08-04 12:04:39'),
(101, 2, '<p></p>', 1, 2, '2026-08-04 12:04:52'),
(102, 2, '<p><code>document_version</code> usually refers to a <strong>version number</strong> of a document. It is used to keep track of changes made to a document over time.</p><p>In a collaborative editor like yours (similar to Google Docs), multiple users may edit the same document simultaneously. A version number helps the system know whether the document has changed and can be used to prevent conflicts.</p>', 2, 2, '2026-08-04 12:05:22'),
(103, 2, '<p><code>document_version</code><strong> u</strong>sually refers to a <strong>version number</strong> of a document. It is used to keep track of changes made to a document over time.</p><p>In a collaborative editor like yours (similar to Google Docs), multiple users may edit the same document simultaneously. A version number helps the system know whether the document has changed and can be used to prevent conflicts.</p>', 3, 2, '2026-08-04 12:05:27'),
(104, 2, '<p><strong> u</strong>sually refers to a <strong>version number</strong> of a document. It is used to keep track of changes made to a document over time.</p><p>In a collaborative editor like yours (similar to Google Docs), multiple users may edit the same document simultaneously. A version number helps the system know whether the document has changed and can be used to prevent conflicts.</p>', 4, 2, '2026-08-04 12:05:35'),
(105, 2, '<p><code>Document version </code><strong> u</strong>sually refers to a <strong>version number</strong> of a document. It is used to keep track of changes made to a document over time.</p><p>In a collaborative editor like yours (similar to Google Docs), multiple users may edit the same document simultaneously. A version number helps the system know whether the document has changed and can be used to prevent conflicts.</p>', 5, 2, '2026-08-04 12:05:41'),
(106, 2, '<p>sually refers to a <strong>version number</strong> of a document. It is used to keep track of changes made to a document over time.</p><p>In a collaborative editor like yours (similar to Google Docs), multiple users may edit the same document simultaneously. A version number helps the system know whether the document has changed and can be used to prevent conflicts.</p>', 6, 2, '2026-08-04 12:05:57'),
(107, 2, '<p></p><p>sually refers to a <strong>version number</strong> of a document. It is used to keep track of changes made to a document over time.</p><p>In a collaborative editor like yours (similar to Google Docs), multiple users may edit the same document simultaneously. A version number helps the system know whether the document has changed and can be used to prevent conflicts.</p>', 7, 2, '2026-08-04 12:05:59'),
(108, 2, '<p></p><p><code>U</code>sually refers to a <strong>version number</strong> of a document. It is used to keep track of changes made to a document over time.</p><p>In a collaborative editor like yours (similar to Google Docs), multiple users may edit the same document simultaneously. A version number helps the system know whether the document has changed and can be used to prevent conflicts.</p>', 8, 2, '2026-08-04 12:06:01'),
(109, 2, '<p></p><p><code>Document version U</code>sually refers to a <strong>version number</strong> of a document. It is used to keep track of changes made to a document over time.</p><p>In a collaborative editor like yours (similar to Google Docs), multiple users may edit the same document simultaneously. A version number helps the system know whether the document has changed and can be used to prevent conflicts.</p>', 9, 2, '2026-08-04 12:06:05'),
(110, 2, '<p></p><p><code>Document version U</code>suually refers to a <strong>version number</strong> of a document. It is used to keep track of changes made to a document over time.</p><p>In a collaborative editor like yours (similar to Google Docs), multiple users may edit the same document simultaneously. A version number helps the system know whether the document has changed and can be used to prevent conflicts.</p>', 10, 2, '2026-08-04 12:06:09'),
(111, 2, '<p></p><p><code>Document version U</code>susually refers to a <strong>version number</strong> of a document. It is used to keep track of changes made to a document over time.</p><p>In a collaborative editor like yours (similar to Google Docs), multiple users may edit the same document simultaneously. A version number helps the system know whether the document has changed and can be used to prevent conflicts.</p>', 11, 2, '2026-08-04 12:06:13'),
(112, 2, '<p></p><p><code>Document version U</code>s <code>Document version </code>usually refers to a <strong>version number</strong> of a document. It is used to keep track of changes made to a document over time.</p><p>In a collaborative editor like yours (similar to Google Docs), multiple users may edit the same document simultaneously. A version number helps the system know whether the document has changed and can be used to prevent conflicts.</p>', 12, 2, '2026-08-04 12:06:18'),
(113, 2, '<p><code>Document version </code>usually refers to a <strong>version number</strong> of a document. It is used to keep track of changes made to a document over time.</p><p>In a collaborative editor like yours (similar to Google Docs), multiple users may edit the same document simultaneously. A version number helps the system know whether the document has changed and can be used to prevent conflicts.</p>', 13, 2, '2026-08-04 12:06:22'),
(114, 2, '<p><code>Document version </code>usually refers to a version <strong>number</strong> of a document. It is used to keep track of changes made to a document over time.</p><p>In a collaborative editor like yours (similar to Google Docs), multiple users may edit the same document simultaneously. A version number helps the system know whether the document has changed and can be used to prevent conflicts.</p>', 14, 2, '2026-08-04 12:06:29'),
(115, 2, '<p><code>Document version </code>usually refers to a <strong>version number</strong> of a document. It is used to keep track of changes made to a document over time.</p><p>In a collaborative editor like yours (similar to Google Docs), multiple users may edit the same document simultaneously. A version number helps the system know whether the document has changed and can be used to prevent conflicts.</p>', 15, 2, '2026-08-04 12:06:36'),
(116, 2, '<p><code>Document version </code>usually refers to a <strong>version <u>number</u></strong><u> </u>of a document. It is used to keep track of changes made to a document over time.</p><p>In a collaborative editor like yours (similar to Google Docs), multiple users may edit the same document simultaneously. A version number helps the system know whether the document has changed and can be used to prevent conflicts.</p>', 16, 2, '2026-08-04 12:06:39'),
(117, 2, '<p><code>Document version </code>usually refers to a <strong>version <u>number</u></strong><u> </u>of a document. It is used to keep track of changes made to a document over time.</p><p>In a collaborative editor like yours (similar to Google Docs), multiple users may edit the same document simultaneously. A version number helps the system know whether the document has changed and can be used to prevent conflicts.</p>', 17, 2, '2026-08-04 12:06:48'),
(118, 2, '<p><code>Document version </code>usually refers to a <strong>version <u>number</u></strong><u> </u>of a document. It is used to keep track of changes made to a document over time.</p><p>In a collaborative editor l<s>ike yours (similar to Google Docs)</s>, multiple users may edit the same document simultaneously. A version number helps the system know whether the document has changed and can be used to prevent conflicts.</p>', 18, 2, '2026-08-04 12:07:06'),
(119, 2, '<p><code>Document version </code>usually refers to a <strong>version <u>number</u></strong><u> </u>of a document. It is used to keep track of changes made to a document over time.</p><p>In a collaborative editor  multiple users may edit the same document simultaneously. A version number helps the system know whether the document has changed and can be used to prevent conflicts.</p>', 19, 2, '2026-08-04 12:07:12'),
(120, 2, '<p><code>Document version </code>usually refers to a <strong>version <u>number</u></strong><u> </u>of a document. It is used to keep track of changes made to a document over time.</p><p>In a <s>collaborative </s>editor  multiple users may edit the same document simultaneously. A version number helps the system know whether the document has changed and can be used to prevent conflicts.</p>', 20, 2, '2026-08-04 12:07:23'),
(121, 9, '<p></p>', 15, 4, '2026-08-04 12:41:29'),
(122, 8, '<p>hello<br>this is document one...</p><p></p>', 22, 4, '2026-08-04 12:41:46'),
(123, 8, '<p>hello<br>this is document one..</p><p></p>', 23, 4, '2026-08-04 12:41:55'),
(124, 6, '<p>HELLO</p><p></p>', 40, 4, '2026-08-04 12:45:38'),
(125, 8, '<p>hello<br>this is document one..</p><p></p>', 24, 4, '2026-08-04 13:06:36'),
(127, 6, '<p>HELLO</p><p></p>', 41, 4, '2026-08-04 13:07:02'),
(128, 11, '<p>HELLO</p><p></p>', 1, 4, '2026-08-04 13:11:03'),
(129, 12, '<p></p>', 1, 4, '2026-08-04 13:25:35'),
(130, 12, '<p>sdkdmfd/;/g. </p>', 2, 4, '2026-08-04 13:26:09'),
(131, 12, '<p><strong>sdkdmfd</strong>/;/g. </p>', 3, 4, '2026-08-04 13:26:12'),
(132, 12, '<p><strong>sdkdmfd</strong>/;/g.</p>', 4, 4, '2026-08-04 13:26:30'),
(133, 13, '<p><strong>sdkdmfd</strong>/;/g.</p>', 1, 4, '2026-08-04 13:27:03'),
(134, 2, '<p><code>Document version </code>usually refers to a <strong>version <u>number</u></strong><u> </u>of a document. It is used to keep track of changes made to a document over time.</p><p>In a <s>collaborative </s>editor multiple users may edit the same document simultaneously. A version number helps the system know whether the document has changed and can be used to prevent conflicts.</p>', 21, 2, '2026-08-04 13:27:49'),
(135, 13, '<p><strong>sdkdmfd</strong>/;/g.</p>', 2, 4, '2026-08-04 13:27:59'),
(136, 12, '<p><strong>sdkdmfd</strong>/;/g.</p>', 5, 2, '2026-08-04 13:28:16'),
(137, 12, '<p><strong>sdkdmfd</strong>/;/g.</p>', 6, 4, '2026-08-04 13:28:22'),
(138, 12, '<p><strong>sdkdmfd</strong>/;/g. eeu</p>', 7, 2, '2026-08-04 13:28:25'),
(139, 12, '<p><strong>sdkdmfd</strong>/;/g. eeurt</p>', 8, 2, '2026-08-04 13:28:37'),
(140, 12, '<p><strong>sdkdmfd</strong>/;/g. ee</p>', 9, 2, '2026-08-04 13:28:40'),
(141, 12, '<p><strong>sdkdmfd</strong>/;/g. ee</p>', 10, 4, '2026-08-04 13:32:15'),
(142, 5, '<h2>hi<br><strong>hi!</strong>..</h2><p></p>', 13, 4, '2026-08-04 13:40:10'),
(143, 12, '<p><strong>sdkdmfd</strong>/;/g. ee</p>', 11, 4, '2026-08-04 13:40:26'),
(144, 12, '<p><strong>sdkdmfd</strong>/;/g. ee</p>', 12, 2, '2026-08-04 13:42:53'),
(145, 12, '<p><strong>sdkdmfd</strong>/;/g. ee</p>', 13, 4, '2026-08-04 13:49:02'),
(146, 5, '<h2>hi<br><strong>hi!</strong>..</h2><p></p>', 14, 4, '2026-08-05 07:43:50'),
(147, 12, '<p><strong>sdkdmfd</strong>/;/g. ee</p>', 14, 2, '2026-08-05 07:45:11');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `avatar_color` varchar(255) DEFAULT '#2563eb',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `avatar_color`, `created_at`) VALUES
(1, 'Sara', 'sara@gmail.com', '$2b$10$TqQo2XPYeubx/wdHOqTYj.EJ2tUp/v8SFVTxLSwzactur8NzFk5mO', '#2563eb', '2026-08-01 19:40:42'),
(2, 'Saron Tadesse', 'saron@gmail.com', '$2b$10$GI8GzvY4dlqQNqT9Jdh/xufVf2JsC7lYWzyLT.Kyt8xGnTKLDrTb2', '#2563eb', '2026-08-02 08:36:58'),
(3, 'Demo User', 'demo@syncwrite.com', '$2b$10$3Chl7thIgoboOT5ebynp/.UQj0i77eRw4vseVmXAt6tBGax3dNmM2', '#3b82f6', '2026-08-02 18:07:33'),
(4, 'User one', 'user@gmail.com', '$2b$10$.IUG2u0m4a/v.KAEzAbUFeeVCSbpl8XJG0HmicqTFx9gZMqeSOLK2', '#f59e0b', '2026-08-02 19:54:17'),
(5, 'Test User', 'testuser1@example.com', '$2b$10$QOMeuWYzUZVGBlCBtvvzMeFiln7FSTEqiTatV1d6HCz4V7zeXFa.e', '#10b981', '2026-08-03 19:23:28'),
(6, 'Collaborator', 'collaborator@example.com', '$2b$10$oGTedOKu4QUzZ6jEHa6j/udz8pLVuAs16DezAryGihrD9Zmj0DQui', '#ef4444', '2026-08-03 19:36:27'),
(8, 'sara tadese', 'saratadesse@gmail.com', '$2b$10$IbFf./ugOltORiu0MR2uvOMoa1Yo1TG5NEcdu/PADUccuZfmSNtr6', '#ef4444', '2026-08-04 09:10:13');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `document_id` (`document_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `comment_replies`
--
ALTER TABLE `comment_replies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `comment_id` (`comment_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Indexes for table `document_permissions`
--
ALTER TABLE `document_permissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `document_id` (`document_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `document_shares`
--
ALTER TABLE `document_shares`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_share` (`document_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `document_versions`
--
ALTER TABLE `document_versions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `document_id` (`document_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `comment_replies`
--
ALTER TABLE `comment_replies`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `document_permissions`
--
ALTER TABLE `document_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `document_shares`
--
ALTER TABLE `document_shares`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `document_versions`
--
ALTER TABLE `document_versions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=148;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`),
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `comment_replies`
--
ALTER TABLE `comment_replies`
  ADD CONSTRAINT `comment_replies_ibfk_1` FOREIGN KEY (`comment_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comment_replies_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `document_permissions`
--
ALTER TABLE `document_permissions`
  ADD CONSTRAINT `document_permissions_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`),
  ADD CONSTRAINT `document_permissions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `document_shares`
--
ALTER TABLE `document_shares`
  ADD CONSTRAINT `document_shares_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `document_shares_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `document_versions`
--
ALTER TABLE `document_versions`
  ADD CONSTRAINT `document_versions_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `document_versions_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
