import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagInput } from '../components/ui/TagInput';

describe('TagInput', () => {
  it('should render with empty tags', () => {
    render(
      <TagInput
        tags={[]}
        onAddTag={vi.fn()}
        onRemoveTag={vi.fn()}
      />
    );
    
    expect(screen.getByPlaceholderText('Add a tag...')).toBeInTheDocument();
  });

  it('should render with existing tags', () => {
    render(
      <TagInput
        tags={['breakfast', 'easy']}
        onAddTag={vi.fn()}
        onRemoveTag={vi.fn()}
      />
    );
    
    expect(screen.getByText('breakfast')).toBeInTheDocument();
    expect(screen.getByText('easy')).toBeInTheDocument();
  });

  it('should call onAddTag when adding a tag', () => {
    const onAddTag = vi.fn();
    render(
      <TagInput
        tags={[]}
        onAddTag={onAddTag}
        onRemoveTag={vi.fn()}
      />
    );
    
    const input = screen.getByPlaceholderText('Add a tag...');
    fireEvent.change(input, { target: { value: 'new-tag' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(onAddTag).toHaveBeenCalledWith('new-tag');
  });

  it('should call onAddTag when clicking Add button', () => {
    const onAddTag = vi.fn();
    render(
      <TagInput
        tags={[]}
        onAddTag={onAddTag}
        onRemoveTag={vi.fn()}
      />
    );
    
    const input = screen.getByPlaceholderText('Add a tag...');
    fireEvent.change(input, { target: { value: 'new-tag' } });
    
    const addButton = screen.getByText('Add');
    fireEvent.click(addButton);
    
    expect(onAddTag).toHaveBeenCalledWith('new-tag');
  });

  it('should call onRemoveTag when clicking X on tag', () => {
    const onRemoveTag = vi.fn();
    render(
      <TagInput
        tags={['breakfast']}
        onAddTag={vi.fn()}
        onRemoveTag={onRemoveTag}
      />
    );
    
    const removeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(removeButton);
    
    expect(onRemoveTag).toHaveBeenCalledWith('breakfast');
  });

  it('should not add empty tag', () => {
    const onAddTag = vi.fn();
    render(
      <TagInput
        tags={[]}
        onAddTag={onAddTag}
        onRemoveTag={vi.fn()}
      />
    );
    
    const input = screen.getByPlaceholderText('Add a tag...');
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(onAddTag).not.toHaveBeenCalled();
  });

  it('should show suggestions when provided', () => {
    const onAddTag = vi.fn();
    render(
      <TagInput
        tags={[]}
        onAddTag={onAddTag}
        onRemoveTag={vi.fn()}
        suggestions={['breakfast', 'lunch', 'dinner']}
      />
    );
    
    const input = screen.getByPlaceholderText('Add a tag...');
    fireEvent.change(input, { target: { value: 'break' } });
    fireEvent.focus(input);
    
    expect(screen.getByText('breakfast')).toBeInTheDocument();
  });

  it('should filter out already selected tags from suggestions', () => {
    const onAddTag = vi.fn();
    render(
      <TagInput
        tags={['breakfast']}
        onAddTag={onAddTag}
        onRemoveTag={vi.fn()}
        suggestions={['lunch', 'dinner']}
      />
    );
    
    const input = screen.getByPlaceholderText('Add a tag...');
    fireEvent.change(input, { target: { value: 'lun' } });
    fireEvent.focus(input);
    
    expect(screen.getByText('lunch')).toBeInTheDocument();
  });

  it('should add tag from suggestions', () => {
    const onAddTag = vi.fn();
    render(
      <TagInput
        tags={[]}
        onAddTag={onAddTag}
        onRemoveTag={vi.fn()}
        suggestions={['breakfast', 'lunch']}
      />
    );
    
    const input = screen.getByPlaceholderText('Add a tag...');
    fireEvent.change(input, { target: { value: 'break' } });
    fireEvent.focus(input);
    
    const suggestion = screen.getByText('breakfast');
    fireEvent.click(suggestion);
    
    expect(onAddTag).toHaveBeenCalledWith('breakfast');
  });

  it('should display label when provided', () => {
    render(
      <TagInput
        tags={[]}
        onAddTag={vi.fn()}
        onRemoveTag={vi.fn()}
        label="Tags"
      />
    );
    
    expect(screen.getByText('Tags')).toBeInTheDocument();
  });
});