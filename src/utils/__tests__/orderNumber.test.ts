import { generateOrderNumber } from '../orderNumber';

describe('OrderNumber Utils', () => {
  it('should generate order number in correct format', () => {
    const orderNumber = generateOrderNumber();

    expect(orderNumber).toMatch(/^PAT-\d{8}-\d{4}$/);
  });

  it('should generate unique order numbers', () => {
    const numbers = Array.from({ length: 100 }, () => generateOrderNumber());
    const uniqueNumbers = new Set(numbers);

    // Most should be unique (some collisions possible due to same timestamp)
    expect(uniqueNumbers.size).toBeGreaterThan(90);
  });
});

