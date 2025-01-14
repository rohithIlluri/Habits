/** 
 * Cafeteria Problem
 * 
 * A cafeteria table consists of a row of N seats, numbered from 1 to N from left to right.
 * Social distancing guidelines require that every diner be seated such that K seats to their left 
 * and K seats to their right (or all the remaining seats to that side if fewer than K remain) remain empty.
 * 
 * There are currently M diners seated at the table, the ith of whom is in seat S[i]. 
 * No two diners are sitting in the same seat, and the social distancing guidelines are satisfied.
 * 
 * Determine the maximum number of additional diners who can potentially sit at the table without social
 * distancing guidelines being violated for any new or existing diners, assuming that the existing diners 
 * cannot move and that the additional diners will cooperate to maximize how many of them can sit down.
 * 
 * Constraints:
 * 1 ≤ N ≤ 10^15
 * 1 ≤ M ≤ 500,000
 * M ≤ N
 * 1 ≤ S[i] ≤ N
 * 
 * Example 1:
 * Input:
 * N = 10, K = 1, M = 2, S = [2, 6]
 * Output:
 * 3
 * 
 * Example 2:
 * Input:
 * N = 15, K = 2, M = 3, S = [11, 6, 14]
 * Output:
 * 1
 * 
 * Explanation:
 * In the first case, the cafeteria table has N = 10 seats, with two diners currently at seats 2 and 6.
 * Brackets cover K = 1 seat to the left and right of each existing diner. The table initially looks as follows:
 * 1 [2] 3 4 [6] 7 8 9 10
 * Additional diners can sit at seats 4, 8, and 10, so the return value is 3.
 * 
 * In the second case, the table has N = 15 seats, with three diners at seats 11, 6, and 14.
 * The return value is 1 because only one additional diner can fit at seat 3.
 */

import java.util.Arrays;


class Solution {

    public long getMaxAdditionalDinersCount(long N, long K, int M, long[] S) {
        // Write your code here
        Arrays.sort(S);
        long additionalDiners = 0;
        long lastOccupied = 0;

        long firstSeat = S[0];
        additionalDiners += (firstSeat - 1) / (K + 1);

        for (int i = 0; i < M - 1; i++) {
            long gap = S[i + 1] - S[i] - 1;
            if (gap > 0) {
                additionalDiners += Math.max(0, (gap - K) / (K + 1));
            }
        }

        long lastSeat = S[M - 1];
        additionalDiners += (N - lastSeat) / (K + 1);


        return additionalDiners;
    }
}


