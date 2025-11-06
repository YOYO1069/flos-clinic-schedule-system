import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText, Plus, Download, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import SignatureCanvas from 'react-signature-canvas'
import { supabase } from '@/lib/supabase'

// 同意書範本資料（從舊專案照抄）
const consentTemplates = {
  cosmetic_surgery: {
    id: 'cosmetic_surgery',
    title: '美容醫學手術同意書',
    description: '符合醫療法第63條、第64條規定',
    sections: [
      {
        title: '一、手術說明',
        items: [
          '手術原因及目的',
          '手術方式及範圍',
          '手術步驟',
          '手術時間',
          '使用材料及器械'
        ]
      },
      {
        title: '二、手術風險及併發症',
        items: [
          '出血、血腫',
          '感染',
          '疤痕增生',
          '局部麻木或感覺異常',
          '不對稱',
          '效果不如預期',
          '需要再次手術之可能性',
          '麻醉風險（若使用麻醉）'
        ]
      },
      {
        title: '三、替代治療方案',
        items: [
          '其他可行的治療方式',
          '不治療的風險及後果'
        ]
      },
      {
        title: '四、術後注意事項',
        items: [
          '傷口照護方式',
          '飲食限制',
          '活動限制',
          '回診時間',
          '緊急狀況處理',
          '預期恢復時間'
        ]
      },
      {
        title: '五、費用說明',
        items: [
          '手術費用',
          '麻醉費用',
          '材料費用',
          '其他相關費用',
          '退費規定'
        ]
      },
      {
        title: '六、病患權利',
        items: [
          '本人已充分了解上述說明內容',
          '本人有機會提出疑問並獲得解答',
          '本人了解手術風險及併發症',
          '本人了解替代治療方案',
          '本人了解術後注意事項',
          '本人了解費用及退費規定',
          '本人同意接受此項手術'
        ]
      }
    ]
  },
  laser_treatment: {
    id: 'laser_treatment',
    title: '光電治療同意書',
    description: '雷射、脈衝光等光電治療',
    sections: [
      {
        title: '一、治療說明',
        items: [
          '治療目的',
          '治療方式',
          '使用儀器',
          '治療次數',
          '治療間隔'
        ]
      },
      {
        title: '二、可能風險及副作用',
        items: [
          '紅腫、熱感',
          '暫時性色素沉澱或脫失',
          '水泡、結痂',
          '疤痕',
          '效果因人而異',
          '需要多次治療'
        ]
      },
      {
        title: '三、術後照護',
        items: [
          '加強保濕',
          '加強防曬（SPF30以上）',
          '避免刺激性保養品',
          '避免高溫環境',
          '回診時間'
        ]
      },
      {
        title: '四、禁忌症確認',
        items: [
          '本人確認未懷孕',
          '本人無光敏感病史',
          '本人未服用光敏感藥物',
          '本人治療部位無傷口或感染',
          '本人無蟹足腫體質'
        ]
      }
    ]
  },
  injection_treatment: {
    id: 'injection_treatment',
    title: '注射治療同意書',
    description: '玻尿酸、肉毒桿菌等注射治療',
    sections: [
      {
        title: '一、治療說明',
        items: [
          '注射目的',
          '使用產品名稱及劑量',
          '注射部位',
          '預期效果',
          '效果維持時間'
        ]
      },
      {
        title: '二、可能風險及副作用',
        items: [
          '注射部位紅腫、瘀青',
          '局部疼痛或壓痛',
          '感染',
          '過敏反應',
          '效果不對稱',
          '血管栓塞（極罕見但嚴重）',
          '需要補打或調整'
        ]
      },
      {
        title: '三、術後照護',
        items: [
          '注射後6小時內避免按壓',
          '24小時內避免劇烈運動',
          '避免高溫環境（三溫暖、烤箱）',
          '加強保濕及防曬',
          '回診時間'
        ]
      },
      {
        title: '四、禁忌症確認',
        items: [
          '本人確認未懷孕或哺乳',
          '本人無自體免疫疾病',
          '本人無蟹足腫體質',
          '本人注射部位無感染或發炎',
          '本人未服用抗凝血藥物'
        ]
      }
    ]
  }
}

export default function ConsentFormsPage() {
  const navigate = useNavigate()
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [patientName, setPatientName] = useState('')
  const [patientId, setPatientId] = useState('')
  const [treatmentDate, setTreatmentDate] = useState('')
  const [doctorName, setDoctorName] = useState('')
  const patientSigRef = useRef(null)
  const doctorSigRef = useRef(null)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!selectedTemplate || !patientName || !patientId || !treatmentDate || !doctorName) {
      alert('請填寫所有必填欄位')
      return
    }

    if (!patientSigRef.current || patientSigRef.current.isEmpty()) {
      alert('請簽署病患簽名')
      return
    }

    if (!doctorSigRef.current || doctorSigRef.current.isEmpty()) {
      alert('請簽署醫師簽名')
      return
    }

    setSaving(true)

    try {
      const patientSignature = patientSigRef.current.toDataURL()
      const doctorSignature = doctorSigRef.current.toDataURL()

      const { error } = await supabase
        .from('consent_forms')
        .insert({
          template_id: selectedTemplate.id,
          template_title: selectedTemplate.title,
          patient_name: patientName,
          patient_id: patientId,
          treatment_date: treatmentDate,
          doctor_name: doctorName,
          patient_signature: patientSignature,
          doctor_signature: doctorSignature,
          signed_at: new Date().toISOString(),
          status: 'signed'
        })

      if (error) throw error

      alert('同意書已儲存！')
      
      // 清空表單
      setPatientName('')
      setPatientId('')
      setTreatmentDate('')
      setDoctorName('')
      patientSigRef.current?.clear()
      doctorSigRef.current?.clear()
      setSelectedTemplate(null)
    } catch (error) {
      console.error('儲存失敗:', error)
      alert('儲存失敗: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDownloadPDF = () => {
    // 未來可以實現 PDF 下載功能
    alert('PDF 下載功能開發中...')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* 頂部導航欄 - 響應式設計 */}
      <header className="bg-gradient-to-r from-slate-900/60 via-blue-900/60 to-slate-900/60 backdrop-blur-xl border-b border-slate-700/30 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 md:space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/10 w-8 h-8 md:w-10 md:h-10"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-white">同意書範本管理</h1>
                <p className="text-xs text-blue-200 hidden sm:block">電子簽名與範本管理</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-6">
        {!selectedTemplate ? (
          // 範本選擇頁面 - 響應式設計
          <>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">選擇同意書範本</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {Object.values(consentTemplates).map((template) => (
                <Card
                  key={template.id}
                  className="bg-blue-900/40 backdrop-blur-xl border-white/10 hover:bg-blue-900/50 transition-all cursor-pointer hover:scale-105"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-white flex items-center text-base md:text-lg">
                      <FileText className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                      {template.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 pt-0">
                    <p className="text-sm text-blue-200 mb-4">{template.description}</p>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base">
                      使用此範本
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          // 同意書填寫頁面 - 響應式設計
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold text-white">{selectedTemplate.title}</h2>
              <Button
                variant="outline"
                onClick={() => setSelectedTemplate(null)}
                className="text-white border-white/20 hover:bg-white/10 text-sm md:text-base"
              >
                返回
              </Button>
            </div>

            {/* 病患資料 - 響應式設計 */}
            <Card className="bg-blue-900/40 backdrop-blur-xl border-white/10">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-white text-base md:text-lg">病患資料</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-sm text-blue-200 mb-2">病患姓名 *</label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full px-3 md:px-4 py-2 bg-blue-800/30 border border-blue-700/30 rounded-md text-white placeholder:text-gray-400 text-sm md:text-base"
                      placeholder="請輸入病患姓名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-blue-200 mb-2">身分證字號 *</label>
                    <input
                      type="text"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      className="w-full px-3 md:px-4 py-2 bg-blue-800/30 border border-blue-700/30 rounded-md text-white placeholder:text-gray-400 text-sm md:text-base"
                      placeholder="請輸入身分證字號"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-blue-200 mb-2">治療日期 *</label>
                    <input
                      type="date"
                      value={treatmentDate}
                      onChange={(e) => setTreatmentDate(e.target.value)}
                      className="w-full px-3 md:px-4 py-2 bg-blue-800/30 border border-blue-700/30 rounded-md text-white text-sm md:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-blue-200 mb-2">執行醫師 *</label>
                    <input
                      type="text"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      className="w-full px-3 md:px-4 py-2 bg-blue-800/30 border border-blue-700/30 rounded-md text-white placeholder:text-gray-400 text-sm md:text-base"
                      placeholder="請輸入醫師姓名"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 同意書內容 - 響應式設計 */}
            <Card className="bg-blue-900/40 backdrop-blur-xl border-white/10">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-white text-base md:text-lg">同意書內容</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6 pt-0">
                {selectedTemplate.sections.map((section, idx) => (
                  <div key={idx} className="space-y-2">
                    <h3 className="text-base md:text-lg font-semibold text-white">{section.title}</h3>
                    <ul className="list-disc list-inside space-y-1 text-blue-200">
                      {section.items.map((item, itemIdx) => (
                        <li key={itemIdx} className="text-xs md:text-sm">{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}

                <div className="border-t border-white/10 pt-4 mt-6">
                  <p className="text-xs md:text-sm text-blue-200">
                    本同意書符合醫療法第63條、第64條規定，病患有權隨時撤回同意。
                    本同意書一式兩份，病患與診所各執一份。
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 簽名區 - 響應式設計 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <Card className="bg-blue-900/40 backdrop-blur-xl border-white/10">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-white text-base md:text-lg">病患簽名 *</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="bg-white rounded-md p-2">
                    <SignatureCanvas
                      ref={patientSigRef}
                      canvasProps={{
                        className: 'w-full h-32 md:h-40 border border-gray-300 rounded'
                      }}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => patientSigRef.current?.clear()}
                    className="mt-2 text-white border-white/20 hover:bg-white/10 text-xs md:text-sm"
                  >
                    清除簽名
                  </Button>
                  <p className="text-xs text-blue-300 mt-2">
                    簽名日期：{new Date().toLocaleDateString('zh-TW')}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-blue-900/40 backdrop-blur-xl border-white/10">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-white text-base md:text-lg">醫師簽名 *</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="bg-white rounded-md p-2">
                    <SignatureCanvas
                      ref={doctorSigRef}
                      canvasProps={{
                        className: 'w-full h-32 md:h-40 border border-gray-300 rounded'
                      }}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => doctorSigRef.current?.clear()}
                    className="mt-2 text-white border-white/20 hover:bg-white/10 text-xs md:text-sm"
                  >
                    清除簽名
                  </Button>
                  <p className="text-xs text-blue-300 mt-2">
                    簽名日期：{new Date().toLocaleDateString('zh-TW')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* 操作按鈕 - 響應式設計 */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 md:gap-4">
              <Button
                variant="outline"
                onClick={handleDownloadPDF}
                className="text-white border-white/20 hover:bg-white/10 text-sm md:text-base"
              >
                <Download className="w-4 h-4 mr-2" />
                下載 PDF
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm md:text-base"
              >
                {saving ? '儲存中...' : '儲存同意書'}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
