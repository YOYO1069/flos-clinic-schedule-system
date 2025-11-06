import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

/**
 * 同意書組件
 * 整合自 flos-medical-management 專案
 */
const ConsentForms = ({ patientData }) => {
  const [selectedForm, setSelectedForm] = useState(null);
  const [formData, setFormData] = useState({});
  const [agreedItems, setAgreedItems] = useState([]);

  // 同意書模板
  const consentFormTemplates = {
    shockwave: {
      id: 'shockwave',
      title: '低能量體外震波療程同意書',
      code: 'CF-SHOCKWAVE',
      icon: '⚡',
      color: 'from-blue-500 to-blue-600',
      sections: [
        {
          title: '醫師說明事項',
          items: [
            '我已經儘量以病人所能瞭解之方式,解釋這項治療之相關資訊',
            '需實施治療之原因',
            '其他可替代之治療方式',
            '不實施治療可能之後果',
            '如另有治療相關說明資料,我並已交付病人',
            '此治療非屬急迫性質,不於說明當日進行,應經充分時間考慮後再決定施作與否'
          ]
        },
        {
          title: '病患同意聲明',
          items: [
            '醫師已向我解釋,並且我已經瞭解施行這個治療的必要性、步驟、風險、成功率之相關資訊',
            '醫師已向我解釋,並且我已經瞭解選擇其他治療方式之風險',
            '醫師已向我解釋,並且我已經瞭解治療可能預後情況和不進行治療的風險',
            '針對我的情況、治療之進行、治療方式等,我能夠向醫師提出問題和疑慮,並且獲得說明',
            '我瞭解在治療過程中,如果因醫療之必要而切除的組織、醫院可能會將它們保留一段時間進行治療報告,並且在之後會讓它依法處理',
            '我瞭解這個治療無法保證一定能改善病情',
            '醫師已給我充分時間考慮是否接受這個作'
          ]
        }
      ]
    },
    laser: {
      id: 'laser',
      title: '雷射光電治療同意書',
      code: 'CF-LASER',
      icon: '💡',
      color: 'from-purple-500 to-purple-600',
      sections: [
        {
          title: '治療說明',
          items: [
            '雷射為特定波長的準直光線,根據選擇性光熱療法的原理',
            '利用不同波長的雷射光能作用在標的物之載色體上',
            '或是分段雷射療法,利用均勻分散的微小雷射光束加熱破壞皮膚表皮及真皮層',
            '刺激皮膚再生反應'
          ]
        },
        {
          title: '治療目的',
          items: [
            '色素性病灶:包括雀斑、老人斑、黑痣、顴骨母斑、太田母斑、刺青等',
            '血管性病灶:如微細血管增生、酒糟、血管瘤、疤痕等',
            '其他如:除毛、除皺等'
          ]
        },
        {
          title: '可能併發症',
          items: [
            '雷射治療後的皮膚泛紅通常可在短時間內恢復',
            '治療部位會感到灼熱感及開放式傷口有微量流血,輕微紅腫為正常反應',
            '少數病患有灼傷、血腫、出血或傷口疤痕(0.3-2%)或細菌感染(0.5-4.5%)',
            '會有黑色素沉澱(10-32%)現象,若妥善保養勿曬太陽,仍有恢復的機會',
            '黑色素變少(1-20%)現象大部分短期內可恢復'
          ]
        },
        {
          title: '術後注意事項',
          items: [
            '患部因局部麻醉及照射,在治療後數小時或數日內,會有浮腫現象',
            '患部一般會有滲透液流出或皮膚瘀青,約1至2週後可消失',
            '可能會有痂皮產生,此時勿用手指刮除,讓其自行脫落,對皮膚癒合較有利'
          ]
        }
      ]
    },
    injection: {
      id: 'injection',
      title: '注射治療同意書',
      code: 'CF-INJECTION',
      icon: '💉',
      color: 'from-pink-500 to-pink-600',
      sections: [
        {
          title: '治療說明',
          items: [
            '注射治療包括肉毒桿菌素、玻尿酸、膠原蛋白等填充物注射',
            '用於改善皺紋、填補凹陷、輪廓雕塑等美容目的',
            '治療效果因個人體質而異,可能需要多次治療'
          ]
        },
        {
          title: '可能風險',
          items: [
            '注射部位可能出現紅腫、瘀青、疼痛等暫時性反應',
            '極少數情況下可能發生過敏反應',
            '不對稱或效果不如預期的情況',
            '需要補打或調整的可能性'
          ]
        }
      ]
    },
    skincare: {
      id: 'skincare',
      title: '醫學美容療程同意書',
      code: 'CF-SKINCARE',
      icon: '✨',
      color: 'from-green-500 to-green-600',
      sections: [
        {
          title: '療程說明',
          items: [
            '醫學美容療程包括各類保養、護理、美白等非侵入性治療',
            '療程目的在於改善膚質、提升肌膚狀態',
            '效果因個人膚質、生活習慣而有所差異'
          ]
        },
        {
          title: '注意事項',
          items: [
            '療程期間請配合醫師指示進行居家保養',
            '避免過度日曬,做好防曬措施',
            '如有任何不適請立即告知醫護人員'
          ]
        }
      ]
    },
    surgery: {
      id: 'surgery',
      title: '手術治療同意書',
      code: 'CF-SURGERY',
      icon: '🏥',
      color: 'from-red-500 to-red-600',
      sections: [
        {
          title: '手術說明',
          items: [
            '醫師已詳細說明手術目的、方式、過程',
            '已告知手術可能之風險及併發症',
            '已說明術後恢復期及注意事項',
            '已說明替代治療方案'
          ]
        },
        {
          title: '麻醉說明',
          items: [
            '已說明麻醉方式及可能風險',
            '已告知麻醉前後注意事項',
            '已確認無麻醉禁忌症'
          ]
        },
        {
          title: '病患同意',
          items: [
            '我已充分瞭解手術相關資訊',
            '我同意接受此手術治療',
            '我瞭解手術無法保證100%成功',
            '我同意醫師在手術中依實際狀況調整術式'
          ]
        }
      ]
    },
    general: {
      id: 'general',
      title: '一般治療同意書',
      code: 'CF-GENERAL',
      icon: '📋',
      color: 'from-gray-500 to-gray-600',
      sections: [
        {
          title: '治療說明',
          items: [
            '醫師已說明治療目的及方式',
            '已告知可能之風險及副作用',
            '已說明替代治療方案',
            '已回答病患提出之問題'
          ]
        },
        {
          title: '病患權利',
          items: [
            '我有權利詢問任何治療相關問題',
            '我有權利拒絕治療',
            '我有權利要求第二意見',
            '我的個人資料將受到保密'
          ]
        }
      ]
    }
  };

  // 處理表單選擇
  const handleSelectForm = (formId) => {
    setSelectedForm(consentFormTemplates[formId]);
    setFormData({
      patient_name: patientData?.user_name || '',
      patient_phone: patientData?.phone || '',
      patient_line: patientData?.line_id || '',
      treatment_date: new Date().toISOString().split('T')[0],
      doctor_name: '',
      treatment_reason: '',
      cost_items: ''
    });
    setAgreedItems([]);
  };

  // 處理同意項目勾選
  const handleAgreeItem = (index) => {
    if (agreedItems.includes(index)) {
      setAgreedItems(agreedItems.filter(i => i !== index));
    } else {
      setAgreedItems([...agreedItems, index]);
    }
  };

  // 處理表單提交
  const handleSubmit = () => {
    // 檢查是否所有必要項目都已勾選
    const totalItems = selectedForm.sections.reduce((sum, section) => sum + section.items.length, 0);
    if (agreedItems.length < totalItems) {
      alert('請確認所有同意項目');
      return;
    }

    // 這裡可以將同意書資料儲存到資料庫
    console.log('同意書資料:', {
      form: selectedForm,
      data: formData,
      agreed: agreedItems,
      timestamp: new Date().toISOString()
    });

    alert('同意書已送出!');
    setSelectedForm(null);
  };

  if (!selectedForm) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">選擇同意書類型</h2>
          <p className="text-gray-600">請選擇需要填寫的同意書</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(consentFormTemplates).map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-xl transition-all duration-300 backdrop-blur-xl bg-white/80 border-white/20 hover:scale-105"
              onClick={() => handleSelectForm(template.id)}
            >
              <CardContent className="p-6">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${template.color} flex items-center justify-center text-3xl mb-4 mx-auto`}>
                  {template.icon}
                </div>
                <h3 className="text-lg font-bold text-center mb-2">{template.title}</h3>
                <p className="text-sm text-gray-500 text-center">{template.code}</p>
                <Button className="w-full mt-4" variant="outline">
                  選擇此同意書 →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 標題列 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-3xl">{selectedForm.icon}</span>
            {selectedForm.title}
          </h2>
          <p className="text-sm text-gray-500 mt-1">表單編號: {selectedForm.code}</p>
        </div>
        <Button variant="outline" onClick={() => setSelectedForm(null)}>
          ← 返回選擇
        </Button>
      </div>

      {/* 病患基本資料 */}
      <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle>病患基本資料</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>病患姓名</Label>
              <Input
                value={formData.patient_name}
                onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                placeholder="請輸入姓名"
              />
            </div>
            <div>
              <Label>聯絡電話</Label>
              <Input
                value={formData.patient_phone}
                onChange={(e) => setFormData({ ...formData, patient_phone: e.target.value })}
                placeholder="請輸入電話"
              />
            </div>
            <div>
              <Label>LINE ID</Label>
              <Input
                value={formData.patient_line}
                onChange={(e) => setFormData({ ...formData, patient_line: e.target.value })}
                placeholder="請輸入LINE ID"
              />
            </div>
            <div>
              <Label>治療日期</Label>
              <Input
                type="date"
                value={formData.treatment_date}
                onChange={(e) => setFormData({ ...formData, treatment_date: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 治療資訊 */}
      <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle>治療資訊</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>主治醫師</Label>
              <Input
                value={formData.doctor_name}
                onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                placeholder="請輸入醫師姓名"
              />
            </div>
            <div>
              <Label>治療原因</Label>
              <Textarea
                value={formData.treatment_reason}
                onChange={(e) => setFormData({ ...formData, treatment_reason: e.target.value })}
                placeholder="請說明建議治療原因"
                rows={3}
              />
            </div>
            <div>
              <Label>費用明細</Label>
              <Textarea
                value={formData.cost_items}
                onChange={(e) => setFormData({ ...formData, cost_items: e.target.value })}
                placeholder="請列出各項費用"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 同意書內容 */}
      {selectedForm.sections.map((section, sectionIndex) => (
        <Card key={sectionIndex} className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
          <CardHeader>
            <CardTitle>{section.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {section.items.map((item, itemIndex) => {
                const globalIndex = selectedForm.sections
                  .slice(0, sectionIndex)
                  .reduce((sum, s) => sum + s.items.length, 0) + itemIndex;
                
                return (
                  <div
                    key={itemIndex}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <Checkbox
                      id={`item-${globalIndex}`}
                      checked={agreedItems.includes(globalIndex)}
                      onCheckedChange={() => handleAgreeItem(globalIndex)}
                    />
                    <label
                      htmlFor={`item-${globalIndex}`}
                      className="text-sm leading-relaxed cursor-pointer flex-1"
                    >
                      {item}
                    </label>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* 簽名區 */}
      <Card className="backdrop-blur-xl bg-white/80 border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle>簽名確認</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>病患簽名</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                <p className="text-gray-500">點擊此處進行電子簽名</p>
                <p className="text-xs text-gray-400 mt-2">(功能開發中)</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>簽署日期</Label>
                <Input type="date" value={new Date().toISOString().split('T')[0]} readOnly />
              </div>
              <div className="flex-1">
                <Label>與病患關係</Label>
                <Input placeholder="本人" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 提交按鈕 */}
      <div className="flex gap-4 justify-end">
        <Button variant="outline" onClick={() => setSelectedForm(null)}>
          取消
        </Button>
        <Button
          onClick={handleSubmit}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
        >
          確認送出同意書
        </Button>
      </div>
    </div>
  );
};

export default ConsentForms;
