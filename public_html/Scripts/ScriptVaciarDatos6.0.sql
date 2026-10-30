-- =====================================================
-- Script: Vaciar Base de Datos GSA
-- Versión: 6.0 (compatible con Script6.0.sql)
-- =====================================================

USE `duobusinesslingo`;

-- Desactivar verificaciones de claves foráneas
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO';

-- =========================================================
-- VACIAR TABLAS (orden inverso a dependencias)
-- =========================================================

-- Assessment dinámico
DELETE FROM `assessment_regla`;
DELETE FROM `assessment_opcion`;
DELETE FROM `assessment_pregunta`;

-- Respuestas y progreso de usuarios
DELETE FROM `respuesta_usuario`;
DELETE FROM `progreso_bloque`;
DELETE FROM `bloque_usuario`;

-- Ejercicios y niveles
DELETE FROM `nivel_ejercicio`;
DELETE FROM `respuesta_ejercicio`;
DELETE FROM `ejercicio`;
DELETE FROM `nivel`;

-- Foro y reseñas
DELETE FROM `mensaje_foro`;
DELETE FROM `reseña`;



-- Suscripciones
DELETE FROM `suscripcion`;
DELETE FROM `plan_suscripcion`;

-- Tokens y resets de contraseña
DELETE FROM `tokens_invalidados`;
DELETE FROM `password_resets`;

-- Bloques y usuarios (al final)
DELETE FROM `bloque`;
DELETE FROM `usuario`;

-- =========================================================
-- RESETEAR AUTO_INCREMENT
-- =========================================================
ALTER TABLE `assessment_regla` AUTO_INCREMENT = 1;
ALTER TABLE `assessment_opcion` AUTO_INCREMENT = 1;
ALTER TABLE `assessment_pregunta` AUTO_INCREMENT = 1;
ALTER TABLE `respuesta_usuario` AUTO_INCREMENT = 1;
ALTER TABLE `progreso_bloque` AUTO_INCREMENT = 1;
ALTER TABLE `bloque_usuario` AUTO_INCREMENT = 1;
ALTER TABLE `nivel_ejercicio` AUTO_INCREMENT = 1;
ALTER TABLE `respuesta_ejercicio` AUTO_INCREMENT = 1;
ALTER TABLE `ejercicio` AUTO_INCREMENT = 1;
ALTER TABLE `nivel` AUTO_INCREMENT = 1;
ALTER TABLE `mensaje_foro` AUTO_INCREMENT = 1;
ALTER TABLE `reseña` AUTO_INCREMENT = 1;
ALTER TABLE `suscripcion` AUTO_INCREMENT = 1;
ALTER TABLE `plan_suscripcion` AUTO_INCREMENT = 1;
ALTER TABLE `tokens_invalidados` AUTO_INCREMENT = 1;
ALTER TABLE `password_resets` AUTO_INCREMENT = 1;
ALTER TABLE `bloque` AUTO_INCREMENT = 1;
ALTER TABLE `usuario` AUTO_INCREMENT = 1;

-- Restaurar configuración
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET SQL_MODE=@OLD_SQL_MODE;

-- =====================================================
-- FIN DEL SCRIPT DE VACIADO
-- =====================================================
