-- =====================================================
-- Script Completo: Estructura de Base de Datos GSA
-- Versión: 6.0 (incluye Assessment Dinámico)
-- Fecha: 2026-01-02
-- =====================================================

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `duobusinesslingo` DEFAULT CHARACTER SET utf8mb4;
USE `duobusinesslingo`;

-- =====================================================
-- TABLAS PRINCIPALES DEL SISTEMA
-- =====================================================

-- -----------------------------------------------------
-- Table `usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `usuario` (
  `idUsuario` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(150) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `fechaRegistro` DATETIME NOT NULL,
  `esAdmin` TINYINT(1) NOT NULL DEFAULT 0,
  `username` VARCHAR(50) NULL DEFAULT NULL,
  `telefono` VARCHAR(20) NULL DEFAULT NULL,
  `url_imagen` VARCHAR(255) NULL DEFAULT NULL,
  PRIMARY KEY (`idUsuario`),
  UNIQUE INDEX `email` (`email`),
  UNIQUE INDEX `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4;

-- -----------------------------------------------------
-- Table `bloque`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bloque` (
  `idBloque` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(45) NOT NULL,
  `descripcion` TEXT NOT NULL,
  `finalidad` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`idBloque`)
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4;

-- -----------------------------------------------------
-- Table `bloque_usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `bloque_usuario` (
  `idBloqueUsuario` INT(11) NOT NULL AUTO_INCREMENT,
  `idUsuario` INT(11) NOT NULL,
  `idBloque` INT(11) NOT NULL,
  `fechaDesbloqueo` DATETIME NOT NULL,
  `fechaFin` DATETIME NOT NULL,
  `razonDesbloqueo` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`idBloqueUsuario`),
  INDEX `idUsuario` (`idUsuario`),
  INDEX `idBloque` (`idBloque`),
  CONSTRAINT `bloque_usuario_ibfk_1`
    FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `bloque_usuario_ibfk_2`
    FOREIGN KEY (`idBloque`) REFERENCES `bloque` (`idBloque`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4;

-- -----------------------------------------------------
-- Table `ejercicio`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `ejercicio` (
  `idEjercicio` INT(11) NOT NULL AUTO_INCREMENT,
  `tipo` VARCHAR(50) NOT NULL,
  `pregunta` TEXT NOT NULL,
  `idBloque` INT(11) NOT NULL,
  PRIMARY KEY (`idEjercicio`),
  INDEX `idBloque` (`idBloque`),
  CONSTRAINT `ejercicio_ibfk_1`
    FOREIGN KEY (`idBloque`) REFERENCES `bloque` (`idBloque`)
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4;

-- -----------------------------------------------------
-- Table `nivel`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `nivel` (
  `idNivel` INT(11) NOT NULL AUTO_INCREMENT,
  `idBloque` INT(11) NOT NULL,
  `nivel` TINYINT(4) NOT NULL,
  PRIMARY KEY (`idNivel`),
  INDEX `idBloque` (`idBloque`),
  CONSTRAINT `nivel_ibfk_1`
    FOREIGN KEY (`idBloque`) REFERENCES `bloque` (`idBloque`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4;

-- -----------------------------------------------------
-- Table `respuesta_ejercicio`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `respuesta_ejercicio` (
  `idRespuesta` INT(11) NOT NULL AUTO_INCREMENT,
  `idEjercicio` INT(11) NOT NULL,
  `texto` VARCHAR(255) NOT NULL,
  `esCorrecta` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`idRespuesta`),
  INDEX `idEjercicio` (`idEjercicio`),
  CONSTRAINT `respuesta_ejercicio_ibfk_1`
    FOREIGN KEY (`idEjercicio`) REFERENCES `ejercicio` (`idEjercicio`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4;

-- -----------------------------------------------------
-- Table `respuesta_usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `respuesta_usuario` (
  `idRespuestaUsuario` INT(11) NOT NULL AUTO_INCREMENT,
  `idUsuario` INT(11) NOT NULL,
  `idEjercicio` INT(11) NOT NULL,
  `idRespuesta` INT(11) NOT NULL,
  `esCorrecta` TINYINT(1) NOT NULL,
  `fecha` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(),
  PRIMARY KEY (`idRespuestaUsuario`),
  INDEX `idUsuario` (`idUsuario`),
  INDEX `idEjercicio` (`idEjercicio`),
  INDEX `idRespuesta` (`idRespuesta`),
  CONSTRAINT `respuesta_usuario_ibfk_1`
    FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`),
  CONSTRAINT `respuesta_usuario_ibfk_2`
    FOREIGN KEY (`idEjercicio`) REFERENCES `ejercicio` (`idEjercicio`),
  CONSTRAINT `respuesta_usuario_ibfk_3`
    FOREIGN KEY (`idRespuesta`) REFERENCES `respuesta_ejercicio` (`idRespuesta`)
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4;

-- -----------------------------------------------------
-- Table `progreso_bloque`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `progreso_bloque` (
  `idProgreso` INT(11) NOT NULL AUTO_INCREMENT,
  `idUsuario` INT(11) NOT NULL,
  `idBloque` INT(11) NOT NULL,
  `porcentajeCompletado` TINYINT(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`idProgreso`),
  INDEX `idUsuario` (`idUsuario`),
  INDEX `idBloque` (`idBloque`),
  CONSTRAINT `progreso_bloque_ibfk_1`
    FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `progreso_bloque_ibfk_2`
    FOREIGN KEY (`idBloque`) REFERENCES `bloque` (`idBloque`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4;

-- -----------------------------------------------------
-- Table `mensaje_foro`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mensaje_foro` (
  `idMensaje` INT(11) NOT NULL AUTO_INCREMENT,
  `idUsuario` INT(11) NOT NULL,
  `contenido` TEXT NOT NULL,
  `fechaCreacion` DATETIME NOT NULL,
  PRIMARY KEY (`idMensaje`),
  INDEX `idUsuario` (`idUsuario`),
  CONSTRAINT `mensaje_foro_ibfk_1`
    FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`)
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4;

-- -----------------------------------------------------
-- Table `plan_suscripcion`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `plan_suscripcion` (
  `idPlan` INT(11) NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(50) NOT NULL,
  `precio` DECIMAL(10,2) NOT NULL,
  `duracion_dias` INT(11) NOT NULL,
  `descripcion` TEXT NULL DEFAULT NULL,
  PRIMARY KEY (`idPlan`)
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4;

-- -----------------------------------------------------
-- Table `suscripcion`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `suscripcion` (
  `idSuscripcion` INT(11) NOT NULL AUTO_INCREMENT,
  `idUsuario` INT(11) NOT NULL,
  `idPlan` INT(11) NOT NULL,
  `fechaInicio` DATETIME NOT NULL,
  `fechaFin` DATETIME NOT NULL,
  `estado` VARCHAR(20) DEFAULT 'activa',
  PRIMARY KEY (`idSuscripcion`),
  INDEX `idUsuario` (`idUsuario`),
  INDEX `idPlan` (`idPlan`),
  CONSTRAINT `suscripcion_ibfk_1`
    FOREIGN KEY (`idUsuario`) REFERENCES `usuario` (`idUsuario`),
  CONSTRAINT `suscripcion_ibfk_2`
    FOREIGN KEY (`idPlan`) REFERENCES `plan_suscripcion` (`idPlan`)
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4;


-- -----------------------------------------------------
-- Table `reseña`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `reseña` (
  `idReseña` INT(11) NOT NULL AUTO_INCREMENT,
  `idUsuario` INT(11) NOT NULL,
  `valoracion` INT(1) NOT NULL,
  `textoOpinion` VARCHAR(100) NULL DEFAULT NULL,
  PRIMARY KEY (`idReseña`),
  FOREIGN KEY (`idUsuario`) REFERENCES `usuario`(`idUsuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `nivel_ejercicio`
-- Relación N:M entre nivel y ejercicio
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `nivel_ejercicio` (
  `idNivel` INT(11) NOT NULL,
  `idEjercicio` INT(11) NOT NULL,
  PRIMARY KEY (`idNivel`, `idEjercicio`),
  INDEX `idEjercicio` (`idEjercicio`),
  CONSTRAINT `nivel_ejercicio_ibfk_1`
    FOREIGN KEY (`idNivel`) REFERENCES `nivel` (`idNivel`)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `nivel_ejercicio_ibfk_2`
    FOREIGN KEY (`idEjercicio`) REFERENCES `ejercicio` (`idEjercicio`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARACTER SET=utf8mb4;

-- =====================================================
-- NUEVAS TABLAS: ASSESSMENT DINÁMICO
-- =====================================================

-- -----------------------------------------------------
-- Table `assessment_pregunta`
-- Preguntas del formulario de evaluación (multiidioma)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `assessment_pregunta` (
  `idPregunta` INT(11) NOT NULL AUTO_INCREMENT,
  `orden` INT(11) NOT NULL DEFAULT 0,
  `texto_es` VARCHAR(500) NOT NULL,
  `texto_en` VARCHAR(500) NULL DEFAULT NULL,
  `texto_pt` VARCHAR(500) NULL DEFAULT NULL,
  `permite_multiple` TINYINT(1) NOT NULL DEFAULT 1,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idPregunta`),
  INDEX `idx_orden` (`orden`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `assessment_opcion`
-- Opciones de respuesta para cada pregunta
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `assessment_opcion` (
  `idOpcion` INT(11) NOT NULL AUTO_INCREMENT,
  `idPregunta` INT(11) NOT NULL,
  `orden` INT(11) NOT NULL DEFAULT 0,
  `texto_es` VARCHAR(255) NOT NULL,
  `texto_en` VARCHAR(255) NULL DEFAULT NULL,
  `texto_pt` VARCHAR(255) NULL DEFAULT NULL,
  `icono` VARCHAR(20) NULL DEFAULT NULL,
  `activo` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idOpcion`),
  INDEX `idx_pregunta_orden` (`idPregunta`, `orden`),
  CONSTRAINT `fk_opcion_pregunta` 
    FOREIGN KEY (`idPregunta`) REFERENCES `assessment_pregunta`(`idPregunta`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `assessment_regla`
-- Define qué opciones suman puntos a qué bloques
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `assessment_regla` (
  `idRegla` INT(11) NOT NULL AUTO_INCREMENT,
  `idOpcion` INT(11) NOT NULL,
  `idBloque` INT(11) NOT NULL,
  `puntuacion` INT(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`idRegla`),
  UNIQUE KEY `unique_opcion_bloque` (`idOpcion`, `idBloque`),
  INDEX `idx_opcion` (`idOpcion`),
  INDEX `idx_bloque` (`idBloque`),
  CONSTRAINT `fk_regla_opcion` 
    FOREIGN KEY (`idOpcion`) REFERENCES `assessment_opcion`(`idOpcion`) 
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_regla_bloque` 
    FOREIGN KEY (`idBloque`) REFERENCES `bloque`(`idBloque`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `password_resets`
-- Para recuperación de contraseñas
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `password_resets` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_email` (`email`),
  INDEX `idx_token` (`token`(191))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -----------------------------------------------------
-- Table `tokens_invalidados`
-- Para tokens JWT invalidados (logout)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tokens_invalidados` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `token` TEXT NOT NULL,
  `usuario` INT(11) NOT NULL,
  `fecha_invalidacion` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_usuario` (`usuario`),
  INDEX `idx_fecha` (`fecha_invalidacion`),
  CONSTRAINT `fk_tokens_usuario` 
    FOREIGN KEY (`usuario`) REFERENCES `usuario`(`idUsuario`) 
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =====================================================
-- Restaurar configuración
-- =====================================================
SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
