-- Remove somente o registro demonstrativo; jogadores reais não são afetados.
delete from public."Matches"
where lower(trim("Title")) = 'quinta no arena 8';
