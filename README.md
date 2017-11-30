# Video Summarization using Statistics and Machine Learning
### CSCI576 - Fall 2017 Project
#### Gloria Budiman & Melvin Matthew

### Abstract
Video summarization is downsizing a video into a few related and important keyframes. Video, in essence, can be seen as a collection of frames, temporally related to one another. Seen this way, video summarization is a lossy compression of an input video, producing a few keyframes that viewers can skim rapidly to rapidly overview the video content.

### Implementation
Given a raw video file without any information of Intra-Frames (I-Frames), we approach this problem in 3 steps:
1. Keyframes Extraction
2. Keyframes Importance Ranking
3. Keyframes Blending

#### Keyframes Extraction
Keyframes are similar to I-Frames. They are the initial frames in a scene that is selected in such a way that the remaining frames in a particual scene can be encoded more efficiently with less entropy. Following this definition, a scene consists of this initial frame (keyframe) and the remaining frames for that scene. Our goal in this step is to extract these keyframes. Unlike video encoders which must maintain strict temporal relationship between keyframes and compressed frames (either P- or B- frames), our keyframes extraction does not have this constraint.

Our experience in computer vision lead us to not work at pixel-level directly. We instead opted to use feature-space output of VGG19 neural network trained on ImageNet dataset. All frames are thus feed-forwarded to the VGG19 network. We then store the output from the last max-pooling layer in-memory for further processing. See [VGG19 Feature Extractor](https://github.com/coreylynch/vgg-19-feature-extractor) for visual examples of these features in action.

![VGG19](https://www.cs.toronto.edu/~frossard/post/vgg16/vgg16.png)

Now we have an array of Features in size of (T * W * H), where T is the number of frames in the video, W and H are width and height in pixels respectively. Our next goal is to identify scenes. We use a **First-Order Differentiator (FOD)**. FOD's task is to identify abrupt changes. This can be accomplished easily by linear single-pass scan throughout the Features, comparing two successive frames and recording their Cosine Difference. Abrupt changes in visual Feature is indicated by high value close to 1. We use a combination of adaptive algorithm and timeframe constraint to determine the threshold for FOD. This adaptive algorithm adjusts Cosine Distance threshold dynamically so that fast-paced scenes and slower, gradually changing ones can be detected equally accurately. We also impose a timeframe constraint that prevents scene creation below a certain number of frames in rapidly changing scenes. Consequently, the constraint also mandates scene separation when adaptive algorithm fails to detect new scene after a certain number of frames.

Frames produced by FOD are then marked as keyframes, which creates separation between scenes. We then perform cross-correlation of these keyframes based on their
### References
