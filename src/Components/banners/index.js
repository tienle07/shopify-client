import React, { useContext } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import "./style.css";
import { MyContext } from '../../App';

const Banners = (props) => {
  const context = useContext(MyContext);

  return (
    <>
      {context?.windowWidth > 992 ? (
        <Swiper
          slidesPerView={4}
          spaceBetween={0}
          navigation={true}
          slidesPerGroup={props?.col || 1}
          modules={[Navigation]}
          className="bannerSection pt-3"
          breakpoints={{
            300: {
              slidesPerView: 1,
              spaceBetween: 10,
            },
            400: {
              slidesPerView: 2,
              spaceBetween: 10,
            },
            600: {
              slidesPerView: 3,
              spaceBetween: 10,
            },
            750: {
              slidesPerView: 3,
              spaceBetween: 10,
            },
          }}
        >
          {Array.isArray(props?.data) && props?.data?.length > 0 ? (
            props?.data.map((item, index) => {
              return (
                <SwiperSlide key={index}>
                  <div className="col_">
                    <div className="box">
                      <img
                        src={item?.images?.[0]}
                        className="w-100 transition"
                        alt="banner img"
                      />
                    </div>
                  </div>
                </SwiperSlide>
              );
            })
          ) : (
            <SwiperSlide>
              <div className="col_">
                <div className="box">
                  <p>No data available</p>
                </div>
              </div>
            </SwiperSlide>
          )}
        </Swiper>
      ) : (
        <div
          className="bannerSection pt-3"
          style={{ gridTemplateColumns: `repeat(${props?.col || 1}, 1fr)` }}
        >
          {Array.isArray(props?.data) && props?.data?.length > 0 ? (
            props?.data.map((item, index) => {
              return (
                <div className="col_" key={index}>
                  <div className="box">
                    <img
                      src={item?.images?.[0]}
                      className="w-100 transition"
                      alt="banner img"
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col_">
              <div className="box">
                <p>No data available</p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Banners;
