-- =====================================================
-- Script de Eventos Programados para GSA
-- Versión: 6.0
-- Fecha: 2026-01-03
-- =====================================================
-- 
-- IMPORTANTE: Ejecutar este script después de haber creado
-- las tablas con Script6.0.sql y los datos con 
-- ScriptInsercionDatos6.0.sql
--
-- NOTA: Los eventos requieren que el event_scheduler esté
-- habilitado en MySQL. Verificar con:
-- SHOW VARIABLES LIKE 'event_scheduler';
--
-- Para habilitar (requiere permisos de admin):
-- SET GLOBAL event_scheduler = ON;
-- =====================================================

USE `duobusinesslingo`;

DELIMITER $$

-- -----------------------------------------------------
-- Evento: expire_subscriptions_event
-- Descripción: Cambia el estado de las suscripciones a 
--              'Expirada' cuando la fecha de fin ha pasado
-- Frecuencia: Cada hora
-- -----------------------------------------------------
DROP EVENT IF EXISTS `expire_subscriptions_event`$$

CREATE EVENT `expire_subscriptions_event`
ON SCHEDULE EVERY 1 HOUR
STARTS CURRENT_TIMESTAMP
ON COMPLETION NOT PRESERVE
ENABLE
COMMENT 'Cambia el estado de las suscripciones a Expirada cuando llega la fecha de fin'
DO
  UPDATE suscripcion
  SET estado = 'Expirada'
  WHERE estado = 'Activa'
  AND fechaFin <= NOW()$$

-- -----------------------------------------------------
-- Evento: limpiar_tokens_antiguos
-- Descripción: Elimina tokens invalidados con más de 30 días
--              para mantener la tabla limpia
-- Frecuencia: Cada día
-- -----------------------------------------------------
DROP EVENT IF EXISTS `limpiar_tokens_antiguos`$$

CREATE EVENT `limpiar_tokens_antiguos`
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
ON COMPLETION NOT PRESERVE
ENABLE
COMMENT 'Elimina tokens invalidados con más de 30 días de antigüedad'
DO
  DELETE FROM tokens_invalidados 
  WHERE fecha_invalidacion < DATE_SUB(NOW(), INTERVAL 30 DAY)$$

DELIMITER ;

-- =====================================================
-- Verificar que los eventos se han creado correctamente
-- =====================================================
-- SHOW EVENTS;
-- 
-- Para ver el estado del scheduler:
-- SHOW VARIABLES LIKE 'event_scheduler';
-- =====================================================
