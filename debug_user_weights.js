// Script para debugar a tabela user_exercise_weights
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase (substitua pelas suas credenciais)
const supabaseUrl = 'https://chuonriqolshpejkovub.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNodW9ucmlxb2xzaHBlamtvdnViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MDkxOTIsImV4cCI6MjA3MzA4NTE5Mn0.zAmeKYbQhFf1dRwUz5XBNVrR158xgTePqOrLxKM-Jz4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUserWeights() {
  try {
    console.log('=== DEBUGANDO TABELA user_exercise_weights ===\n');

    // 0. Verificar se a tabela existe
    console.log('🔍 VERIFICANDO SE A TABELA EXISTE:');
    const { data: schemaData, error: schemaError } = await supabase
      .from('user_exercise_weights')
      .select('*', { head: true, count: 'exact' });

    console.log('Schema error:', schemaError);
    console.log('Schema data:', schemaData);

    // 1. Estrutura da tabela (primeiros registros)
    console.log('\n📋 TODOS OS REGISTROS NA TABELA:');
    const { data: allRecords, error: allError } = await supabase
      .from('user_exercise_weights')
      .select('*')
      .limit(10);

    if (allError) {
      console.error('❌ Erro ao buscar registros:', allError);
      return;
    }

    console.log(`📊 Total de registros encontrados: ${allRecords?.length || 0}`);

    if (allRecords && allRecords.length > 0) {
      console.log('\n🔍 ESTRUTURA DOS DADOS:');
      allRecords.forEach((record, index) => {
        console.log(`\n--- Registro ${index + 1} ---`);
        console.log(`ID: ${record.id}`);
        console.log(`User ID: ${record.user_id}`);
        console.log(`Workout ID: ${record.id_workout}`);
        console.log(`Exercise ID: ${record.id_exercise}`);
        console.log(`Weight: ${record.weight}`);
        console.log(`Updated At: ${record.updated_at}`);
      });

      // 2. Buscar por workout específico
      console.log('\n\n🎯 REGISTROS PARA O WORKOUT ESPECÍFICO:');
      const workoutId = '0a493bd6-4dc4-4f14-b454-c3bce5b77874';
      const { data: workoutRecords, error: workoutError } = await supabase
        .from('user_exercise_weights')
        .select('*')
        .eq('id_workout', workoutId);

      if (workoutError) {
        console.error('❌ Erro ao buscar registros do workout:', workoutError);
      } else {
        console.log(`📊 Registros para workout ${workoutId}: ${workoutRecords?.length || 0}`);

        if (workoutRecords && workoutRecords.length > 0) {
          workoutRecords.forEach((record, index) => {
            console.log(`\n--- Workout Record ${index + 1} ---`);
            console.log(`User ID: ${record.user_id}`);
            console.log(`Exercise ID: ${record.id_exercise}`);
            console.log(`Weight: ${record.weight}`);
          });
        } else {
          console.log('⚠️ Nenhum registro encontrado para este workout');
        }
      }

      // 3. Buscar por usuário específico
      console.log('\n\n👤 REGISTROS PARA O USUÁRIO ESPECÍFICO:');
      const userId = 'c89bb76c-dbe3-4930-927c-6089c5f444e8';
      const { data: userRecords, error: userError } = await supabase
        .from('user_exercise_weights')
        .select('*')
        .eq('user_id', userId);

      if (userError) {
        console.error('❌ Erro ao buscar registros do usuário:', userError);
      } else {
        console.log(`📊 Registros para usuário ${userId}: ${userRecords?.length || 0}`);

        if (userRecords && userRecords.length > 0) {
          userRecords.forEach((record, index) => {
            console.log(`\n--- User Record ${index + 1} ---`);
            console.log(`Workout ID: ${record.id_workout}`);
            console.log(`Exercise ID: ${record.id_exercise}`);
            console.log(`Weight: ${record.weight}`);
          });
        } else {
          console.log('⚠️ Nenhum registro encontrado para este usuário');
        }
      }

      // 4. Combinação usuário + workout
      console.log('\n\n🎯👤 REGISTROS PARA USUÁRIO + WORKOUT ESPECÍFICOS:');
      const { data: comboRecords, error: comboError } = await supabase
        .from('user_exercise_weights')
        .select('*')
        .eq('user_id', userId)
        .eq('id_workout', workoutId);

      if (comboError) {
        console.error('❌ Erro ao buscar registros combinados:', comboError);
      } else {
        console.log(`📊 Registros para usuário ${userId} + workout ${workoutId}: ${comboRecords?.length || 0}`);

        if (comboRecords && comboRecords.length > 0) {
          comboRecords.forEach((record, index) => {
            console.log(`\n--- Combo Record ${index + 1} ---`);
            console.log(`Exercise ID: ${record.id_exercise}`);
            console.log(`Weight: ${record.weight}`);
            console.log(`Updated At: ${record.updated_at}`);
          });
        } else {
          console.log('⚠️ Nenhum registro encontrado para esta combinação');
        }
      }

    } else {
      console.log('⚠️ Tabela está vazia ou não acessível');
    }

    console.log('\n=== FIM DO DEBUG ===');

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar o debug
debugUserWeights();