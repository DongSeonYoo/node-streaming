/**
 * 영상 길이를 밀리세컨드 초 단위로 변환
 * @param durationString 영상 길이 format: 'hh:mm:ss'
 * @returns
 */
export const getDurationToMs = (durationString: string): number => {
  const parts = durationString.split(':');
  const hours = parseInt(parts[0], 10) * 3600;
  const minutes = parseInt(parts[1], 10) * 60;
  const seconds = parseInt(parts[2], 10);

  const result = hours + minutes + seconds;

  return result * 1000;
};
