package org.openremote.model.hdi.hdiDTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.openremote.model.rules.Ruleset;
import org.openremote.model.rules.json.JsonRule;
import org.openremote.model.rules.json.RuleCondition;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public class Hdi3TimerSe extends HdiCmdData {
    Long timer_id;
    String date;
    String time;
    Integer duty;
    Integer repeat;
    String nema_list;
    Integer enable;
    public Hdi3TimerSe() {
        super(3,"timer");
    }
    public Hdi3TimerSe(String cron, Long timer_id ,Integer duty, Integer repeat, String nema_list, Integer enable, String byDay) {
        super(3,"timer");
        this.timer_id = timer_id;

       if(byDay==null||byDay.isEmpty()) {
            LocalDate today = LocalDate.now();
            // Định dạng thành chuỗi theo "dd/MM/yyyy"
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            this.date = today.format(formatter);
        }else{
            this.date = byDay;
       }

        String[] cronItem = cron.split(" ");
        this.time = (Integer.parseInt(cronItem[2]) + 7) + ":" + cronItem[1] + ":" + cronItem[0];

        this.duty = duty;
        this.nema_list = nema_list;
        this.repeat = repeat;
        this.enable = enable;
    }


    public Long getTimer_id() {
        return timer_id;
    }

    public void setTimer_id(Long timer_id) {
        this.timer_id = timer_id;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public Integer getDuty() {
        return duty;
    }

    public void setDuty(Integer duty) {
        this.duty = duty;
    }

    public Integer getRepeat() {
        return repeat;
    }

    public void setRepeat(Integer repeat) {
        this.repeat = repeat;
    }

    public String getNema_list() {
        return nema_list;
    }

    public Integer getEnable() {
        return enable;
    }

    public void setEnable(Integer enable) {
        this.enable = enable;
    }

    public void setNema_list(String nema_list) {
        this.nema_list = nema_list;
    }
    @Override
    public String toString() {
        return "Hdi3TimerSe{" +
                "timer_id=" + timer_id +
                ", date='" + date + '\'' +
                ", time='" + time + '\'' +
                ", duty=" + duty +
                ", repeat=" + repeat +
                ", nema_list='" + nema_list + '\'' +
                ", cmd=" + cmd +
                ", data='" + data + '\'' +
                '}';
    }
}
