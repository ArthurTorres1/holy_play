-- Atualizar seção hero para permitir até 3 vídeos
UPDATE home_configurations 
SET max_videos = 3 
WHERE section_id = 'hero';

-- Verificar a atualização
SELECT section_id, section_name, max_videos 
FROM home_configurations 
WHERE section_id = 'hero';
