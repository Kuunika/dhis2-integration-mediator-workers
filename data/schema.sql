
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Client`
--

DROP TABLE IF EXISTS `Client`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Client` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `DataElement`
--

DROP TABLE IF EXISTS `DataElement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `DataElement` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dataElementId` varchar(45) NOT NULL,
  `dataElementName` varchar(500) NOT NULL,
  `dataSetId` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1355 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `DataSet`
--

DROP TABLE IF EXISTS `DataSet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `DataSet` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `clientId` int(11) NOT NULL,
  `categoryCombo` varchar(100) NOT NULL,
  `dhis2Id` varchar(100) NOT NULL,
  `description` varchar(500) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `FailQueue`
--

DROP TABLE IF EXISTS `FailQueue`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `FailQueue` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `value` int(11) NOT NULL,
  `migratedAt` datetime DEFAULT NULL,
  `dataElementId` varchar(100) DEFAULT NULL,
  `migrationId` int(11) DEFAULT NULL,
  `attempts` int(11) DEFAULT NULL,
  `isProcessed` tinyint(1) DEFAULT NULL,
  `isMigrated` tinyint(1) DEFAULT NULL,
  `period` varchar(45) DEFAULT NULL,
  `organizatioUnitCode` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Migration`
--

DROP TABLE IF EXISTS `Migration`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Migration` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uploadedAt` datetime DEFAULT NULL,
  `structureValidatedAt` datetime DEFAULT NULL,
  `structureFailedValidationAt` datetime DEFAULT NULL,
  `elementsAuthorizationAt` datetime DEFAULT NULL,
  `elementsFailedAuthorizationAt` datetime DEFAULT NULL,
  `valuesValidatedAt` datetime DEFAULT NULL,
  `valuesFailedValidationAt` datetime DEFAULT NULL,
  `reportDispatchedAt` datetime DEFAULT NULL,
  `totalMigratedElements` int(11) DEFAULT NULL,
  `totalDataElements` int(11) DEFAULT NULL,
  `totalFailedElements` int(11) DEFAULT NULL,
  `migrationCompletedAt` datetime DEFAULT NULL,
  `clientId` int(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MigrationDataElements`
--

DROP TABLE IF EXISTS `MigrationDataElements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MigrationDataElements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `organizationUnitCode` varchar(45) NOT NULL,
  `dataElementId` int(11) NOT NULL,
  `migrationId` int(11) NOT NULL,
  `value` int(11) NOT NULL,
  `isValueValid` tinyint(4) NOT NULL,
  `isElementAuthorized` tinyint(4) NOT NULL,
  `isProcessed` tinyint(4) NOT NULL,
  `period` varchar(45) NOT NULL,
  `isMigrated` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`,`organizationUnitCode`)
) ENGINE=InnoDB AUTO_INCREMENT=348 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-03-15  8:11:18