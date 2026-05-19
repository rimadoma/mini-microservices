import { describe, it, expect } from 'vitest';
import { moderateComment } from './moderator.js';

const comment = (content: string) => ({ id: 'test-id', postId: 'test-post-id', content });

describe('moderateComment', () => {
    it('rejects comments containing "orange"', () => {
        expect(moderateComment(comment('I love orange'))).toBe('rejected');
    });

    it('rejects regardless of case', () => {
        expect(moderateComment(comment('ORANGE'))).toBe('rejected');
        expect(moderateComment(comment('Orange'))).toBe('rejected');
        expect(moderateComment(comment('oRaNgE'))).toBe('rejected');
    });

    it('rejects when "orange" appears within a word', () => {
        expect(moderateComment(comment('theorangefield'))).toBe('rejected');
        expect(moderateComment(comment('superorangelicious'))).toBe('rejected');
    });

    it('approves comments not containing "orange"', () => {
        expect(moderateComment(comment('I love apples'))).toBe('approved');
    });
});
