/*
Given an integer array nums,
 return true if there exists a triple of indices (i, j, k) such that i < j < k 
 and nums[i] < nums[j] < nums[k]. If no such indices exists, return false.
 */

// Time complexity: O(n)
// Space complexity: O(1)

class Solution {
    public boolean increasingTriplet(int[] nums){
        int first = Integer.MAX_VALUE;
        int second = Integer.MAX_VALUE;
        
        for (int num : nums){
            if(num <= first){
                first = num;
            } else if (num <= second){
                second = num;
            
            }else {
                return false;
            }
        }
    return false;
    
    }
}