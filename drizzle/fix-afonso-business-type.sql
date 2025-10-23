-- Verificar o businessType atual do usuário Afonso
SELECT id, name, email, "businessType", role 
FROM "user" 
WHERE email = 'afonsoburginski@gmail.com';

-- Atualizar o businessType do usuário Afonso para 'servico'
UPDATE "user" 
SET "businessType" = 'servico',
    "updatedAt" = NOW()
WHERE email = 'afonsoburginski@gmail.com';

-- Verificar se a atualização funcionou
SELECT id, name, email, "businessType", role 
FROM "user" 
WHERE email = 'afonsoburginski@gmail.com';

