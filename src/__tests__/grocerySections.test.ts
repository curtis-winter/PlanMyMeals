import { describe, it, expect } from 'vitest';
import { getSection, GROCERY_SECTIONS } from '../utils/grocerySections';

describe('getSection', () => {
  it('should return Produce for fruits and vegetables', () => {
    expect(getSection('apple')).toBe('Produce');
    expect(getSection('banana')).toBe('Produce');
    expect(getSection('lettuce')).toBe('Produce');
    expect(getSection('spinach')).toBe('Produce');
    expect(getSection('carrot')).toBe('Produce');
    expect(getSection('avocado')).toBe('Produce');
  });

  it('should return Meat & Seafood for meat items', () => {
    expect(getSection('chicken')).toBe('Meat & Seafood');
    expect(getSection('beef')).toBe('Meat & Seafood');
    expect(getSection('pork')).toBe('Meat & Seafood');
    expect(getSection('salmon')).toBe('Meat & Seafood');
    expect(getSection('shrimp')).toBe('Meat & Seafood');
    expect(getSection('bacon')).toBe('Meat & Seafood');
  });

  it('should return Dairy & Eggs for dairy items', () => {
    expect(getSection('milk')).toBe('Dairy & Eggs');
    expect(getSection('egg')).toBe('Dairy & Eggs');
    expect(getSection('cheese')).toBe('Dairy & Eggs');
    expect(getSection('butter')).toBe('Dairy & Eggs');
    expect(getSection('yogurt')).toBe('Dairy & Eggs');
  });

  it('should return Bakery for bread items', () => {
    expect(getSection('bread')).toBe('Bakery');
    expect(getSection('bagel')).toBe('Bakery');
    expect(getSection('tortilla')).toBe('Bakery');
    expect(getSection('muffin')).toBe('Bakery');
  });

  it('should return Pantry & Grains for grains and pantry items', () => {
    expect(getSection('rice')).toBe('Pantry & Grains');
    expect(getSection('pasta')).toBe('Pantry & Grains');
    expect(getSection('flour')).toBe('Pantry & Grains');
    expect(getSection('oat')).toBe('Pantry & Grains');
    expect(getSection('quinoa')).toBe('Pantry & Grains');
  });

  it('should return Canned & Jarred for canned items', () => {
    expect(getSection('canned soup')).toBe('Canned & Jarred');
    expect(getSection('sauce')).toBe('Canned & Jarred');
    expect(getSection('pickle')).toBe('Canned & Jarred');
    expect(getSection('olive')).toBe('Canned & Jarred');
  });

  it('should return Frozen for frozen items', () => {
    expect(getSection('frozen pizza')).toBe('Frozen');
    expect(getSection('frozen vegetables')).toBe('Frozen');
  });

  it('should return Beverages for drinks', () => {
    expect(getSection('water')).toBe('Beverages');
    expect(getSection('juice')).toBe('Beverages');
    expect(getSection('coffee')).toBe('Beverages');
    expect(getSection('tea')).toBe('Beverages');
  });

  it('should return Spices & Baking for spices and baking items', () => {
    expect(getSection('salt')).toBe('Spices & Baking');
    expect(getSection('cinnamon')).toBe('Spices & Baking');
    expect(getSection('baking powder')).toBe('Spices & Baking');
  });

  it('should return Other for unknown items', () => {
    expect(getSection('random item')).toBe('Other');
    expect(getSection('unknown food')).toBe('Other');
  });

  it('should be case insensitive', () => {
    expect(getSection('APPLE')).toBe('Produce');
    expect(getSection('Apple')).toBe('Produce');
    expect(getSection('CHICKEN')).toBe('Meat & Seafood');
  });

  it('should match partial keywords', () => {
    expect(getSection('chicken breast')).toBe('Meat & Seafood');
    expect(getSection('grilled chicken')).toBe('Meat & Seafood');
    expect(getSection('apple juice')).toBe('Produce');
  });
});