import { DataSource } from 'typeorm';
import { Bed, BedStatus } from '../bed/entities/bed.entity';

export async function seedBeds(dataSource: DataSource) {
  if (process.env.SEED_BEDS !== 'true') {
    return;
  }

  const bedRepository = dataSource.getRepository(Bed);

  // Check if beds already exist
  const existingBeds = await bedRepository.count();
  if (existingBeds > 0) {
    return;
  }

  const beds: Partial<Bed>[] = [];
  for (let i = 1; i <= 20; i++) {
    let room = 'WARD-1';
    let notes = 'Standard hospital bed';

    if (i > 5 && i <= 10) room = 'WARD-2';
    else if (i > 10 && i <= 15) {
      room = 'ICU-1';
      notes = 'ICU monitoring bed';
    } else if (i > 15) {
      room = `PRIVATE-${i - 15}`;
      notes = 'Private room bed';
    }

    beds.push({
      bedNumber: `B${i}`,
      room: room,
      status: BedStatus.AVAILABLE,
      notes: notes,
      headPosition: 0,
      rightTiltPosition: 0,
      leftTiltPosition: 0,
      legPosition: 0,
    });
  }

  await bedRepository.save(beds);
  console.log(`Seeded ${beds.length} beds successfully!`);
}
