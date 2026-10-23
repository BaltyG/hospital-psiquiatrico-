-- Ver a los estudiantes y las materias que están cursando con su calificación
SELECT e.nombre || ' ' || e.primer_apellido AS Estudiante, c.nombre_curso, i.calificacion_final
FROM estudiante e
JOIN inscripcion i ON e.id_estudiante = i.id_estudiante
JOIN curso c ON i.id_curso = c.id_curso;

-- Promedio de calificaciones por curso
SELECT c.nombre_curso, AVG(i.calificacion_final) AS Promedio_Curso
FROM curso c
JOIN inscripcion i ON c.id_curso = i.id_curso
GROUP BY c.nombre_curso;

-- Estudiantes que tienen la calificación más alta (Subconsulta)
SELECT nombre, primer_apellido FROM estudiante
WHERE id_estudiante IN (
    SELECT id_estudiante FROM inscripcion WHERE calificacion_final = (SELECT MAX(calificacion_final) FROM inscripcion)
);