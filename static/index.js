const video = document.getElementById('upload-video');
const videoFile = document.getElementById('video-file');

const videoTag = document.getElementById('video');
const playBtn = document.getElementById('play-btn');
const videoIdxInput = document.getElementById('video-idx-input');
const videoValue = '1716275673865-199907';

const manifestPathTextDiv = document.createElement('div');

video.addEventListener('click', async () => {
  const formData = new FormData();

  formData.append('video', videoFile.files[0]);
  formData.append('title', '테스트 비디오');
  formData.append('videoLength', '5');

  uploadVideoFetch(formData);
});

const uploadVideoFetch = async (formData) => {
  try {
    const response = await fetch('/learning-content/lecture-video', {
      method: 'POST',
      body: formData,
    });

    const json = await response.json();
    if (response.status !== 200) {
      return;
    }

    alert('업로드된 비디오 인덱스: ' + json.lectureVideoIdx);
  } catch (error) {
    console.log(error);
  }
};

playBtn.addEventListener('click', async () => {
  if (!videoIdxInput.value) {
    alert('비디오 인덱스를 입력해주세요.');
    return;
  }

  const response = await fetch(`/learning-content/lecture-video/${videoIdxInput.value}`);
  const json = await response.json();
  if (response.status !== 200) {
    alert(`response.status: ${response.status}\nmessage: ${json.message}`);
    return;
  }

  const videoSrc = `/stream/${json.lectureVideoUrl}/`;

  try {
    const player = videojs('video');
    player.src({
      src: videoSrc,
      type: 'application/x-mpegURL',
    });
    player.play();
  } catch (error) {
    alert(error);
  }
});
