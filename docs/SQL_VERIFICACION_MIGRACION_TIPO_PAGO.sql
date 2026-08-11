-- Verificación segura para migración: agregar Transaccion.tipoPago
-- Uso:
-- 1) Ejecutar BLOQUE A (PRE-MIGRACIÓN)
-- 2) Ejecutar migración: npx prisma migrate deploy
-- 3) Ejecutar BLOQUE B (POST-MIGRACIÓN)

-- =====================================================
-- BLOQUE A: PRE-MIGRACIÓN
-- =====================================================
-- Guardar baseline (no modifica datos funcionales)
CREATE TABLE IF NOT EXISTS public.__migration_tipo_pago_baseline (
  id INTEGER PRIMARY KEY DEFAULT 1,
  total_transacciones BIGINT NOT NULL,
  total_suscripciones BIGINT NOT NULL,
  taken_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO public.__migration_tipo_pago_baseline (id, total_transacciones, total_suscripciones, taken_at)
VALUES (
  1,
  (SELECT COUNT(*) FROM "Transaccion"),
  (SELECT COUNT(*) FROM "Suscripcion"),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  total_transacciones = EXCLUDED.total_transacciones,
  total_suscripciones = EXCLUDED.total_suscripciones,
  taken_at = EXCLUDED.taken_at;

SELECT
  'PRECHECK_TOTAL_TRANSACCIONES' AS check_name,
  total_transacciones AS value,
  'OK' AS status
FROM public.__migration_tipo_pago_baseline
WHERE id = 1;

SELECT
  'PRECHECK_TOTAL_SUSCRIPCIONES' AS check_name,
  total_suscripciones AS value,
  'OK' AS status
FROM public.__migration_tipo_pago_baseline
WHERE id = 1;

-- =====================================================
-- BLOQUE B: POST-MIGRACIÓN
-- =====================================================
-- 1) Confirmar que existe la columna y default esperado
SELECT
  'POSTCHECK_COLUMNA_TIPOPAGO' AS check_name,
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Transaccion'
        AND column_name = 'tipoPago'
    ) THEN 'EXISTS'
    ELSE 'MISSING'
  END AS value,
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Transaccion'
        AND column_name = 'tipoPago'
    ) THEN 'OK'
    ELSE 'ERROR'
  END AS status;

SELECT
  'POSTCHECK_DEFAULT_TIPOPAGO' AS check_name,
  COALESCE(column_default, 'NULL') AS value,
  CASE
    WHEN column_default ILIKE '%OTRO%' THEN 'OK'
    ELSE 'WARN'
  END AS status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'Transaccion'
  AND column_name = 'tipoPago';

-- 2) Validar que no se perdieron filas
SELECT
  'POSTCHECK_TOTAL_TRANSACCIONES' AS check_name,
  COUNT(*) AS value,
  CASE
    WHEN COUNT(*) = (SELECT total_transacciones FROM public.__migration_tipo_pago_baseline WHERE id = 1)
      THEN 'OK'
    ELSE 'ERROR'
  END AS status
FROM "Transaccion";

SELECT
  'POSTCHECK_TOTAL_SUSCRIPCIONES' AS check_name,
  COUNT(*) AS value,
  CASE
    WHEN COUNT(*) = (SELECT total_suscripciones FROM public.__migration_tipo_pago_baseline WHERE id = 1)
      THEN 'OK'
    ELSE 'ERROR'
  END AS status
FROM "Suscripcion";

-- 3) Validar que no haya nulos y distribución esperable
SELECT
  'POSTCHECK_TIPOPAGO_NULLS' AS check_name,
  COUNT(*) AS value,
  CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'ERROR' END AS status
FROM "Transaccion"
WHERE "tipoPago" IS NULL;

SELECT
  'POSTCHECK_DISTRIBUCION_TIPOPAGO' AS check_name,
  "tipoPago" AS value,
  COUNT(*)::TEXT AS status
FROM "Transaccion"
GROUP BY "tipoPago"
ORDER BY COUNT(*) DESC;
