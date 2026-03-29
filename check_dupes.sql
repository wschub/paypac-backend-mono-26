SELECT firebase_uid, COUNT(*) FROM "User" GROUP BY firebase_uid HAVING COUNT(*) > 1;
