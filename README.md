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

Frames produced by FOD are then marked as keyframes, which creates separation between scenes. We then perform cross-correlation of these keyframes based on their Cosine Distance. A typical FOD result looks like the heat map below, with lighter colors indicate similar frames and darker colors indicate different frames.

![Step1](https://github.com/gbudiman/effigy/blob/master/public/docs_step1.png)

FOD may detect blank, dark scene as keyframes. We need to remove such frames. To do so, we convert all frames to HSL colorspace. We take the mean and standard deviation of Luminance from all frames and remove those with average Luminance two standard deviations below mean. **This is the only part of the algorithm that works at pixel-level**.

FOD is a coarse method in determining scenes. It has advantage in speed due to its single-pass, non-windowing method in detecting scene change. The disadvantage is obvious, FOD may not recognize scene separation in gradual changes. To detect this, we have the **Second Pass Analysis (SPA)**.

SPA analyzes each scene independently and performs cross-correlation of the frames inside that particular scene by their Cosine Distance. SPA then attempts to detect clustering by iteratively running Principal Component Analysis (PCA). SPA increases PCA's number of clusters until it can capture 80% of the variance in the scene. This number is derived empirically through experiments. Knowing the number of appropriate clusters allows us to subdivide the scene into smaller ones, effectively inserting new separating keyframes. If we have more than one clusters, FOD must have missed the scene change.

A typical smooth scene with steady motion looks like the following

![Step2_Gradual](https://github.com/gbudiman/effigy/blob/master/public/docs_step2_gradual.png)

A scene with alternating scenes looks like the heatmap below. In this case, SPA detects that 2 clusters are needed to capture 80% variance in the scene.

![Step2_Alternating](https://github.com/gbudiman/effigy/blob/master/public/docs_step2_alternating.png)

Thus, a new keyframe is inserted. For reference, the keyframes extracted from the video look like the figure below. It is obvious (to human) that there is a scene change, yet FOD missed it.

![Step2_Alternating_Example](https://github.com/gbudiman/effigy/blob/master/public/docs_step2_alternating_example.png)

With the new keyframes, it is possible that we have generated similar keyframes resulting in overpopulation. A typical output from SPA looks like the following:

![Step3](https://github.com/gbudiman/effigy/blob/master/public/docs_step3.png) 

Unlike video encoders that must maintain temporal constraints between I-Frames, Keyframe Extraction do not need the non-distinct keyframes. We can discard similar keyframes by voting and statistical process. First, we cross-correlate the Cosine Distance from all keyframes at this point. Then we take the mean and standard deviation. Frames which have Cosine Distance two standard deviations below the mean are moved to the elimination pool. Then each remaining keyframes "vote" which of the frames in the elimination pool stay by selecting a frame with the highest Luminance value. This voting process is necessary because keyframes similarity has many-to-many relationship property. The final result of Keyframe Extraction is visualized in the heat map below.

![Step4](https://github.com/gbudiman/effigy/blob/master/public/docs_step4.png)
### References
