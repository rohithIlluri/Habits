/*
 * Problem: Director of Photography
 *
 * A photography set consists of N cells in a row, represented by a string C of length N.
 * Each cell can contain one of the following:
 * - 'P': Photographer
 * - 'A': Actor
 * - 'B': Backdrop
 * - '.': Empty cell
 *
 * A valid artistic photograph consists of a photographer, an actor, and a backdrop such that:
 * - The actor is between the photographer and the backdrop.
 * - The distance between the photographer and the actor is between X and Y (inclusive).
 * - The distance between the actor and the backdrop is between X and Y (inclusive).
 *
 * Two photographs are considered different if they involve different photographer, actor, or backdrop cells.
 *
 * The goal is to determine the total number of valid artistic photographs.
 */

 class Solution {
    public int getArtisticPhotographCount(int N, String C, int X, int Y) {
        int count = 0; // Counter for valid photographs

        // Iterate through each position to identify potential actors
        for (int actor = 0; actor < N; actor++) {
            // Skip if the current cell is not an actor ('A')
            if (C.charAt(actor) != 'A') continue;

            // Check for photographers ('P') to the left and backdrops ('B') to the right
            count += countPhotographs(C, actor, -1, X, Y, 'P', 'B');

            // Check for photographers ('P') to the right and backdrops ('B') to the left
            count += countPhotographs(C, actor, 1, X, Y, 'P', 'B');
        }

        return count; // Return the total count of artistic photographs
    }

    /*
     * Helper method to count valid photographs in one direction
     *
     * @param C: The string representation of the photography set
     * @param actor: The index of the actor
     * @param direction: -1 for left-to-right, 1 for right-to-left
     * @param X: Minimum distance constraint
     * @param Y: Maximum distance constraint
     * @param photographer: Character representing the photographer ('P')
     * @param backdrop: Character representing the backdrop ('B')
     * @return The count of valid photographs in this direction
     */
    private int countPhotographs(String C, int actor, int direction, int X, int Y, char photographer, char backdrop) {
        int count = 0;

        // Determine the range of valid photographer positions based on the direction
        int photographerStart = calculateStart(actor, direction, X, Y, true, C.length());
        int photographerEnd = calculateEnd(actor, direction, X, Y, true, C.length());

        // Loop through possible photographer positions
        for (int photographerPos = photographerStart; photographerPos <= photographerEnd; photographerPos++) {
            // Skip if the current cell is not a photographer ('P')
            if (C.charAt(photographerPos) != photographer) continue;

            // Determine the range of valid backdrop positions based on the direction
            int backdropStart = calculateStart(actor, direction, X, Y, false, C.length());
            int backdropEnd = calculateEnd(actor, direction, X, Y, false, C.length());

            // Loop through possible backdrop positions
            for (int backdropPos = backdropStart; backdropPos <= backdropEnd; backdropPos++) {
                // Skip if the current cell is not a backdrop ('B')
                if (C.charAt(backdropPos) != backdrop) continue;

                // Increment count for a valid (P, A, B) combination
                count++;
            }
        }

        return count; // Return the count of valid combinations for the current actor
    }

    /*
     * Helper method to calculate the starting index for a valid range
     *
     * @param actor: The index of the actor
     * @param direction: -1 for left-to-right, 1 for right-to-left
     * @param X: Minimum distance constraint
     * @param Y: Maximum distance constraint
     * @param isPhotographer: True for photographer, false for backdrop
     * @param length: The total length of the string
     * @return The starting index of the range
     */
    private int calculateStart(int actor, int direction, int X, int Y, boolean isPhotographer, int length) {
        if (isPhotographer) {
            return direction == -1 ? Math.max(0, actor - Y) : Math.max(0, actor + X);
        } else {
            return direction == -1 ? Math.max(0, actor + X) : Math.max(0, actor - Y);
        }
    }

    /*
     * Helper method to calculate the ending index for a valid range
     *
     * @param actor: The index of the actor
     * @param direction: -1 for left-to-right, 1 for right-to-left
     * @param X: Minimum distance constraint
     * @param Y: Maximum distance constraint
     * @param isPhotographer: True for photographer, false for backdrop
     * @param length: The total length of the string
     * @return The ending index of the range
     */
    private int calculateEnd(int actor, int direction, int X, int Y, boolean isPhotographer, int length) {
        if (isPhotographer) {
            return direction == -1 ? Math.min(actor - X, length - 1) : Math.min(actor + Y, length - 1);
        } else {
            return direction == -1 ? Math.min(actor + Y, length - 1) : Math.min(actor - X, length - 1);
        }
    }
}
